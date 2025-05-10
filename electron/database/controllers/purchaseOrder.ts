import type { IpcMain } from "electron";
import { PurchaseOrder, PurchaseOrderProduct } from "../models/purchaseOrder"; // Import PurchaseOrderProduct
import { Product } from "../models/product";
import { sequelize } from "../index";

export const registerPurchaseOrderController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-purchase-orders", async () => {
    try {
      const orders = await PurchaseOrder.findAll({
        include: [{ model: PurchaseOrderProduct, as: "products" }], // Include products
      });
      return orders.map((order) => ({
        dataValues: order.get({ plain: true }),
      }));
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  });

  ipcMain.handle("add-purchase-order", async (event, purchaseOrder) => {
    const t = await sequelize.transaction();
    try {
      const newOrder: any = await PurchaseOrder.create(
        {
          supplierId: purchaseOrder.supplierId,
          orderDate: purchaseOrder.orderDate,
          totalAmount: purchaseOrder.totalAmount,
          status: purchaseOrder.status,
        },
        { transaction: t }
      );

      if (purchaseOrder.products?.length) {
        const products = purchaseOrder.products.map((p: any) => ({
          purchaseOrderId: newOrder.id, // Corrected to purchaseOrderId
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        }));

        await PurchaseOrderProduct.bulkCreate(products, { transaction: t }); // Use PurchaseOrderProduct

        if (purchaseOrder.status === "received") {
          for (const p of purchaseOrder.products) {
            await Product.increment("stockQuantity", {
              by: p.quantity,
              where: { id: p.product_id },
              transaction: t,
            });
          }
        }
      }
      const orderWithProducts = await PurchaseOrder.findOne({
        where: { id: newOrder.id },
        include: [{ model: PurchaseOrderProduct, as: "products" }],
        transaction: t,
      });

      await t.commit();
      return { dataValues: orderWithProducts?.get({ plain: true }) };
    } catch (error) {
      await t.rollback();
      console.error("Error adding purchase order:", error);
      throw error;
    }
  });

  ipcMain.handle("edit-purchase-order", async (event, id, purchaseOrder) => {
    const t = await sequelize.transaction();
    try {
      const existingOrder: any = await PurchaseOrder.findByPk(id, {
        transaction: t,
      });
      const existingOrderProducts: any = await PurchaseOrderProduct.findAll({
        // Fetch existing products
        where: { purchaseOrderId: id },
        transaction: t,
      });

      await PurchaseOrder.update(
        {
          supplierId: purchaseOrder.supplierId,
          orderDate: purchaseOrder.orderDate,
          totalAmount: purchaseOrder.totalAmount,
          status: purchaseOrder.status,
        },
        { where: { id }, transaction: t }
      );

      // Handle stock quantity changes based on order status
      if (existingOrder && existingOrder.status !== purchaseOrder.status) {
        if (purchaseOrder.status === "cancelled") {
          for (const product of existingOrderProducts) {
            await Product.decrement("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        } else if (existingOrder.status === "cancelled") {
          // previous status was cancelled
          if (purchaseOrder.products) {
            for (const product of purchaseOrder.products) {
              await Product.increment("stockQuantity", {
                by: product.quantity,
                where: { id: product.product_id },
                transaction: t,
              });
            }
          }
        } else if (purchaseOrder.status === "received") {
          for (const product of existingOrderProducts) {
            await Product.increment("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        } else if (existingOrder.status === "received") {
          if (purchaseOrder.products) {
            for (const product of purchaseOrder.products) {
              await Product.decrement("stockQuantity", {
                by: product.quantity,
                where: { id: product.product_id },
                transaction: t,
              });
            }
          }
        }
      } else if (purchaseOrder.products) {
        // handle product quantity changes
        await PurchaseOrderProduct.destroy({
          // use PurchaseOrderProduct
          where: { purchaseOrderId: id },
          transaction: t,
        });

        const products = purchaseOrder.products.map((p: any) => ({
          purchaseOrderId: id,
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        }));
        await PurchaseOrderProduct.bulkCreate(products, { transaction: t }); // Use PurchaseOrderProduct

        // Adjust stock based on changes in products
        for (const newProduct of purchaseOrder.products) {
          const oldProduct: any = existingOrderProducts.find(
            (op: any) => op.product_id === newProduct.product_id
          );

          if (oldProduct) {
            const quantityDifference =
              newProduct.quantity - oldProduct.quantity;
            await Product.increment("stockQuantity", {
              by: quantityDifference,
              where: { id: newProduct.product_id },
              transaction: t,
            });
          } else {
            await Product.increment("stockQuantity", {
              by: newProduct.quantity,
              where: { id: newProduct.product_id },
              transaction: t,
            });
          }
        }
        const removedProducts = existingOrderProducts.filter(
          (oldProduct: any) =>
            !purchaseOrder.products.some(
              (newProduct: any) =>
                newProduct.product_id === oldProduct.product_id
            )
        );

        for (const removedProduct of removedProducts) {
          await Product.decrement("stockQuantity", {
            by: removedProduct.quantity,
            where: { id: removedProduct.product_id },
            transaction: t,
          });
        }
      }
      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error("Error editing purchase order:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-purchase-order", async (event, id) => {
    const t = await sequelize.transaction();
    try {
      const order: any = await PurchaseOrder.findByPk(id, {
        include: [{ model: PurchaseOrderProduct, as: "products" }], // Include products
        transaction: t,
      });

      if (order) {
        const products: any = order.products;
        if (order.status === "received" && products && products.length > 0) {
          for (const product of products) {
            await Product.decrement("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        }
        await PurchaseOrderProduct.destroy({
          where: { purchaseOrderId: id },
          transaction: t,
        }); // Delete products
        await PurchaseOrder.destroy({ where: { id }, transaction: t });
        await t.commit();
        return { success: true };
      }
      await t.rollback();
      return { success: false, error: "Order not found" };
    } catch (error) {
      await t.rollback();
      console.error("Error deleting purchase order:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-multiple-purchase-orders", async (event, ids) => {
    const t = await sequelize.transaction();
    try {
      const orders: any = await PurchaseOrder.findAll({
        //find all orders to be deleted
        where: { id: ids },
        include: [{ model: PurchaseOrderProduct, as: "products" }], // Include products
        transaction: t,
      });

      for (const order of orders) {
        const products: any = order.products;
        if (order.status === "received" && products && products.length > 0) {
          for (const product of products) {
            await Product.decrement("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        }
      }
      await PurchaseOrderProduct.destroy({
        where: { purchaseOrderId: ids },
        transaction: t,
      }); // Corrected key
      await PurchaseOrder.destroy({ where: { id: ids }, transaction: t });
      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error("Error deleting multiple purchase orders:", error);
      throw error;
    }
  });
};
