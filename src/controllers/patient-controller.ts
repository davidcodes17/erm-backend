import { Request, Response } from "express";
import { patientSchema } from "../schema/patient-schema";
import { IUserPayload } from "../types/all-types";
import prisma from "../prismaClient";

export const addPatient = async (req: Request, res: Response) => {
  try {
    const { error, value } = patientSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        message: `Validation Error: ${error.details[0].message}`,
        success: false,
      });
      return;
    }

    const {
      address,
      bloodType,
      city,
      dateOfBirth,
      email,
      emergencyContacts,
      firstName,
      gender,
      lastName,
      phoneNumber,
      physicalInfo,
      state,
      zipCode,
      doctorDiagnosis,
    } = value as IUserPayload;

    const isPresent = await prisma.user.findUnique({ where: { email } });
    if (isPresent) {
      res.status(400).json({
        message: "A patient with this email already exists.",
        success: false,
      });
      return;
    }

    const patient = await prisma.user.create({
      data: {
        address,
        bloodType,
        city,
        dateOfBirth: new Date(dateOfBirth),
        email,
        firstName,
        gender,
        lastName,
        phoneNumber,
        state,
        zipCode,
        emergencyContacts: {
          create: emergencyContacts,
        },
        physicalInfo: {
          create: physicalInfo,
        },
        doctorDiagnosis: doctorDiagnosis
          ? {
              create: doctorDiagnosis,
            }
          : undefined,
      },
      include: {
        emergencyContacts: true,
        physicalInfo: true,
        doctorDiagnosis: true,
      },
    });

    res.status(201).json({
      message: "Patient created successfully.",
      success: true,
      patient,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while creating the patient.",
      success: false,
    });
    return;
  }
};
export const editPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "Patient ID is required.",
        success: false,
      });
      return;
    }

    const { error, value } = patientSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: `Validation Error: ${error.details[0].message}`,
        success: false,
      });
      return;
    }

    const {
      address,
      bloodType,
      city,
      dateOfBirth,
      email,
      emergencyContacts,
      firstName,
      gender,
      lastName,
      phoneNumber,
      physicalInfo,
      state,
      zipCode,
      doctorDiagnosis,
    } = value as IUserPayload;

    const existingPatient = await prisma.user.findUnique({ where: { id } });
    if (!existingPatient) {
      res.status(404).json({
        message: "Patient does not exist.",
        success: false,
      });
      return;
    }

    // Delete existing nested relations
    await prisma.emergencyContact.deleteMany({ where: { userId: id } });
    await prisma.physicalInformation.deleteMany({ where: { userId: id } });
    await prisma.doctorDiagnosis.deleteMany({ where: { userId: id } });

    // Update patient and nested records
    const updatedPatient = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        gender,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        bloodType,
        email,
        address,
        city,
        state,
        zipCode,
        emergencyContacts: {
          create: emergencyContacts,
        },
        physicalInfo: {
          create: physicalInfo,
        },
        doctorDiagnosis: doctorDiagnosis
          ? {
              create: doctorDiagnosis,
            }
          : undefined,
      },
      include: {
        emergencyContacts: true,
        physicalInfo: true,
        doctorDiagnosis: true,
      },
    });

    res.status(200).json({
      message: "Patient updated successfully.",
      success: true,
      patient: updatedPatient,
    });
    return;
  } catch (error) {
    console.error("Edit Patient Error:", error);
    res.status(500).json({
      message: "Something went wrong while updating the patient.",
      success: false,
    });
    return;
  }
};
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.user.findMany({
      include: {
        _count: true,
        doctorDiagnosis: true,
        emergencyContacts: true,
        labResults: true,
        physicalInfo: true,
      },
    });

    res.status(200).json({
      message: "Patients retrieved successfully.",
      data: patients,
      success: true,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Unable to retrieve patients.",
      success: false,
    });
    return;
  }
};
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(400)
        .json({ message: "Patient ID is required", success: false });
      return;
    }

    // Check if user exists
    const patient = await prisma.user.findUnique({ where: { id } });
    if (!patient) {
      res.status(404).json({ message: "Patient not found", success: false });
      return;
    }

    // Delete dependent records first
    await prisma.labResult.deleteMany({ where: { userId: id } });
    await prisma.emergencyContact.deleteMany({ where: { userId: id } });
    await prisma.physicalInformation.deleteMany({ where: { userId: id } });
    await prisma.doctorDiagnosis.deleteMany({ where: { userId: id } });

    // Now delete the user
    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      message: "Patient deleted successfully.",
      success: true,
    });
    return;
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({
      message: "Failed to delete patient.",
      success: false,
    });
    return;
  }
};
export const getSinglePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: "Patient ID is required.",
        success: false,
      });
      return;
    }

    const patient = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: true,
        doctorDiagnosis: true,
        emergencyContacts: true,
        labResults: true,
        physicalInfo: true,
      },
    });

    if (!patient) {
      res.status(404).json({
        message: "Patient not found.",
        success: false,
      });
      return;
    }

    res.status(200).json({
      message: "Patient retrieved successfully.",
      data: patient,
      success: true,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Unable to retrieve patient.",
      success: false,
    });
    return;
  }
};
export const addEmergencyContact = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { fullName, phoneNumber, email, relationship } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });

    const contact = await prisma.emergencyContact.create({
      data: { fullName, phoneNumber, email, relationship, userId },
    });

    res
      .status(201)
      .json({ message: "Emergency contact added", success: true, contact });
  } catch (err) {
    res.status(500).json({ message: "Failed to add contact", success: false });
  }
};
export const updateEmergencyContact = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, phoneNumber, email, relationship } = req.body;

  try {
    const contact = await prisma.emergencyContact.update({
      where: { id },
      data: { fullName, phoneNumber, email, relationship },
    });

    res
      .status(200)
      .json({ message: "Contact updated", success: true, contact });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update contact", success: false });
  }
};
export const deleteEmergencyContact = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.emergencyContact.delete({ where: { id } });
    res.status(200).json({ message: "Contact deleted", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete contact", success: false });
  }
};
export const upsertDiagnosis = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { knownMedicalConditions, allergies } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res
        .status(404)
        .json({ message: "Patient not found", success: false });

    await prisma.doctorDiagnosis.deleteMany({ where: { userId } });

    const diagnosis = await prisma.doctorDiagnosis.create({
      data: { userId, knownMedicalConditions, allergies },
    });

    res
      .status(200)
      .json({ message: "Diagnosis updated", success: true, diagnosis });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update diagnosis", success: false });
  }
};
export const getDiagnosis = async (req: Request, res: Response) => {
  const { id: userId } = req.params;

  try {
    const diagnosis = await prisma.doctorDiagnosis.findUnique({
      where: { userId },
    });

    if (!diagnosis) {
      return res
        .status(404)
        .json({ message: "No diagnosis found", success: false });
    }

    res
      .status(200)
      .json({ message: "Diagnosis retrieved", success: true, diagnosis });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch diagnosis", success: false });
  }
};
export const addLabResult = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { message, doctorId } = req.body;

  try {
    const labResult = await prisma.labResult.create({
      data: {
        userId,
        doctorId,
        message,
      },
    });

    res
      .status(201)
      .json({ message: "Lab result added", success: true, labResult });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add lab result", success: false });
  }
};
export const getLabResults = async (req: Request, res: Response) => {
  const { id: userId } = req.params;

  try {
    const results = await prisma.labResult.findMany({
      where: { userId },
      include: { doctor: true },
    });

    res
      .status(200)
      .json({ message: "Lab results retrieved", success: true, results });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch lab results", success: false });
  }
};
export const getSingleLabResult = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await prisma.labResult.findUnique({
      where: { id },
      include: { doctor: true, user: true },
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Lab result not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Lab result retrieved", success: true, result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch lab result", success: false });
  }
};
export const addPhysicalInfo = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { name, diagnosis, phone, address, notes } = req.body;

  try {
    const info = await prisma.physicalInformation.create({
      data: {
        userId,
        name,
        diagnosis,
        phone,
        address,
        notes,
      },
    });

    res
      .status(201)
      .json({ message: "Physical info added", success: true, info });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add physical info", success: false });
  }
};
export const updatePhysicalInfo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, diagnosis, phone, address, notes } = req.body;

  try {
    const info = await prisma.physicalInformation.update({
      where: { id },
      data: { name, diagnosis, phone, address, notes },
    });

    res
      .status(200)
      .json({ message: "Physical info updated", success: true, info });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update physical info", success: false });
  }
};
export const deletePhysicalInfo = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.physicalInformation.delete({ where: { id } });
    res.status(200).json({ message: "Physical info deleted", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete physical info", success: false });
  }
};
