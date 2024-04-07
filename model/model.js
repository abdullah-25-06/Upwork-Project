const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: [true, "Enter first name"],
    },
    lastName: {
      type: String,
      require: [true, "Enter last name"],
    },
    email: {
      type: String,
      require: [true, "Enter email"],
      unique: true,
    },
    password: {
      type: String,
      require: [true, "Enter Password"],
    },
    token_detail: { access_token: { type: String }, jti: { type: String } },
  },
  {
    timestamps: true,
  }
);

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     require: [true, "Enter title"],
//   },
//   description: {
//     type: String,
//     require: [true, "Enter description"],
//   },
//   data_url: {
//     type: String,
//     require: [true, "Enter Image"],
//   },
//   completed: {
//     type: Boolean,
//     default: false,
//   },
// });

// const detailSchema = new mongoose.Schema({
//   data: {
//     type: Array,
//     default: [],
//   },
//   title: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Project",
//   },
//   washroom: {
//     type: String,
//   },
//   area: {
//     type: String,
//   },
//   price: {
//     type: String,
//   },
//   bedroom: {
//     type: String,
//   },
// });

const vehicleScheme = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TwoUser",
  },
  make: {
    type: String,
  },
  model: {
    type: String,
  },
  year: {
    type: String,
  },
  vehicleNo: {
    type: String,
  },
  chasisNo: {
    type: String,
  },
  FuelType: {
    type: String,
  },
  images: {
    type: Array,
    default: [],
  },
});

const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  kilometer: {
    type: String,
  },
  days: {
    type: String,
  },
  amount: {
    type: String,
  },
  odometer: {
    type: String,
  },
  date: {
    type: String,
  },
  reminder: {
    type: String,
  },
});
const documentationSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  vehicleNo: {
    type: String,
  },
  name: {
    type: String,
  },
  documentNo: {
    type: String,
  },
  reminders: {
    type: String,
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  reminderDays: {
    type: String,
  },
  originalname: {
    type: String,
  },
  filename: {
    type: String,
  },
});
const TwoUser = mongoose.model("TwoUser", userSchema);
const Vehicle = mongoose.model("Vehicle", vehicleScheme);
const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
const Documentation = mongoose.model("Documentation", documentationSchema);

module.exports = { TwoUser, Vehicle, Maintenance, Documentation };
