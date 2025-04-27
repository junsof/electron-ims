import type { IpcMain } from "electron";
import { SaleOrder, SaleOrderProduct } from "../models/saleOrder";
import { Product } from "../models/product";
import { sequelize } from "../index";

export const registerSaleOrderController = (ipcMain: IpcMain) => {
  ipcMain.handle("get-sales-orders", async () => {
    try {
      const orders = await SaleOrder.findAll({
        include: [{ model: SaleOrderProduct, as: "products" }],
      });
      return orders.map((order) => ({
        dataValues: order.get({ plain: true }),
      }));
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      throw error;
    }
  });

  ipcMain.handle("add-sales-order", async (event, saleOrder) => {
    const t = await sequelize.transaction();
    try {
      const newOrder: any = await SaleOrder.create(
        {
          customerId: saleOrder.customerId,
          orderDate: saleOrder.orderDate,
          totalAmount: saleOrder.totalAmount,
          status: saleOrder.status,
        },
        { transaction: t }
      );

      if (saleOrder.products?.length) {
        const products = saleOrder.products.map((p) => ({
          saleOrderId: newOrder.id,
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        }));

        await SaleOrderProduct.bulkCreate(products, { transaction: t });

        if (saleOrder.status !== "cancelled") {
          for (const p of saleOrder.products) {
            await Product.decrement("stockQuantity", {
              by: p.quantity,
              where: { id: p.product_id },
              transaction: t,
            });
          }
        }
      }

      const orderWithProducts = await SaleOrder.findOne({
        where: { id: newOrder.id },
        include: [{ model: SaleOrderProduct, as: "products" }],
        transaction: t,
      });

      await t.commit();

      return { dataValues: orderWithProducts?.get({ plain: true }) };
    } catch (error) {
      await t.rollback();
      console.error("Error adding sales order:", error);
      throw error;
    }
  });

  ipcMain.handle("edit-sales-order", async (event, id, saleOrder) => {
    const t = await sequelize.transaction();
    try {
      const existingOrder: any = await SaleOrder.findByPk(id, {
        transaction: t,
      });
      const existingOrderProducts: any = await SaleOrderProduct.findAll({
        where: { saleOrderId: id },
        transaction: t,
      });

      await SaleOrder.update(
        {
          customerId: saleOrder.customerId,
          orderDate: saleOrder.orderDate,
          totalAmount: saleOrder.totalAmount,
          status: saleOrder.status,
        },
        { where: { id }, transaction: t }
      );

      if (existingOrder && existingOrder.status !== saleOrder.status) {
        if (saleOrder.status === "cancelled") {
          for (const product of existingOrderProducts) {
            await Product.increment("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        } else if (existingOrder.status === "cancelled") {
          if (saleOrder.products) {
            for (const product of saleOrder.products) {
              await Product.decrement("stockQuantity", {
                by: product.quantity,
                where: { id: product.product_id },
                transaction: t,
              });
            }
          }
        }
      } else if (saleOrder.products) {
        await SaleOrderProduct.destroy({
          where: { saleOrderId: id },
          transaction: t,
        });

        const products = saleOrder.products.map((p) => ({
          saleOrderId: id,
          product_id: p.product_id,
          quantity: p.quantity,
          price: p.price,
        }));
        await SaleOrderProduct.bulkCreate(products, { transaction: t });

        for (const newProduct of saleOrder.products) {
          const oldProduct: any = existingOrderProducts.find(
            (op: any) => op.product_id === newProduct.product_id
          );

          if (oldProduct) {
            const quantityDifference =
              newProduct.quantity - oldProduct.quantity;

            await Product.decrement("stockQuantity", {
              by: quantityDifference,
              where: { id: newProduct.product_id },
              transaction: t,
            });
          } else {
            await Product.decrement("stockQuantity", {
              by: newProduct.quantity,
              where: { id: newProduct.product_id },
              transaction: t,
            });
          }
        }
        const removedProducts = existingOrderProducts.filter(
          (oldProduct) =>
            !saleOrder.products.some(
              (newProduct) => newProduct.product_id === oldProduct.product_id
            )
        );

        for (const removedProduct of removedProducts) {
          await Product.increment("stockQuantity", {
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
      console.error("Error editing sales order:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-sales-order", async (event, id) => {
    const t = await sequelize.transaction();
    try {
      const order: any = await SaleOrder.findByPk(id, {
        include: [{ model: SaleOrderProduct, as: "products" }],
        transaction: t,
      });

      if (order) {
        const products: any = order.products;
        if (order.status !== "cancelled" && products && products.length > 0) {
          for (const product of products) {
            await Product.increment("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        }
        await SaleOrderProduct.destroy({
          where: { saleOrderId: id },
          transaction: t,
        });
        await SaleOrder.destroy({ where: { id }, transaction: t });
        await t.commit();
        return { success: true };
      }
      await t.rollback();
      return { success: false, error: "Order not found" };
    } catch (error) {
      await t.rollback();
      console.error("Error deleting sales order:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-multiple-sales-orders", async (event, ids) => {
    const t = await sequelize.transaction();
    try {
      const orders: any = await SaleOrder.findAll({
        where: { id: ids },
        include: [{ model: SaleOrderProduct, as: "products" }],
        transaction: t,
      });

      for (const order of orders) {
        const products: any = order.products;
        if (order.status !== "cancelled" && products && products.length > 0) {
          for (const product of products) {
            await Product.increment("stockQuantity", {
              by: product.quantity,
              where: { id: product.product_id },
              transaction: t,
            });
          }
        }
      }

      await SaleOrderProduct.destroy({
        where: { saleOrderId: ids },
        transaction: t,
      });

      await SaleOrder.destroy({ where: { id: ids }, transaction: t });
      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error("Error deleting multiple sales orders:", error);
      throw error;
    }
  });
};
