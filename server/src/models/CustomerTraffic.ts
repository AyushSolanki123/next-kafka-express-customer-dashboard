import mongoose, { Document, Schema } from "mongoose";

export interface ICustomerTraffic extends Document {
  store_id: number;
  customers_in: number;
  customers_out: number;
  time_stamp: Date;
}

const CustomerTrafficSchema: Schema = new Schema({
  store_id: {
    type: Number,
    required: true,
  },
  customers_in: {
    type: Number,
    required: true,
  },
  customers_out: {
    type: Number,
    required: true,
  },
  time_stamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICustomerTraffic>(
  "CustomerTraffic",
  CustomerTrafficSchema
);
