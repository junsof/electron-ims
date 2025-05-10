import { DataTypes } from "sequelize";
import { sequelize } from "../index";
import { Product } from "./product";

export const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "received", "cancelled"),
    allowNull: false,
  },
});

export const PurchaseOrderProduct = sequelize.define(
  "PurchaseOrderProduct",
  {
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "purchaseOrderProducts",
  }
);

PurchaseOrder.hasMany(PurchaseOrderProduct, {
  foreignKey: "purchaseOrderId",
  as: "products",
});
PurchaseOrderProduct.belongsTo(PurchaseOrder, {
  foreignKey: "purchaseOrderId",
});

Product.hasMany(PurchaseOrderProduct, { foreignKey: "product_id" });
PurchaseOrderProduct.belongsTo(Product, { foreignKey: "product_id" });
