import { DataTypes } from "sequelize";
import { sequelize } from "../index";
import { Product } from "./product";

export const SaleOrder = sequelize.define("SaleOrder", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
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

export const SaleOrderProduct = sequelize.define(
  "SaleOrderProduct",
  {
    saleOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SaleOrder,
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
    tableName: "saleOrderProducts",
  }
);

SaleOrder.hasMany(SaleOrderProduct, {
  foreignKey: "saleOrderId",
  as: "products",
});
SaleOrderProduct.belongsTo(SaleOrder, { foreignKey: "saleOrderId" });

Product.hasMany(SaleOrderProduct, { foreignKey: "product_id" });
SaleOrderProduct.belongsTo(Product, { foreignKey: "product_id" });
