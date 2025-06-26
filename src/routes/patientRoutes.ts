import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  addPatient,
  deletePatient,
  editPatient,
  getAllPatients,
  getSinglePatient,
} from "../controllers/patient-controller";

const router = Router();

router.post("/add-patient", authenticate, addPatient);
router.get("/patient/:id", authenticate, getSinglePatient);
router.put("/patient/:id", authenticate, editPatient);
router.delete("/patient/:id", authenticate, deletePatient);
router.get("/patients", authenticate, getAllPatients);

export default router;
