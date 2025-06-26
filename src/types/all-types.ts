export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: Date;
  bloodType: string;
  email: string;
  updatedAt: Date;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContacts: IEmergencyContact[];
  physicalInfo: IPhysicalInformation[];
  doctorDiagnosis?: IDoctorDiagnosis;
  labResults: ILabResult[];
}
export interface IUserPayload {
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: Date;
  bloodType: string;
  email: string;
  updatedAt: Date;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContacts: IEmergencyContact[];
  physicalInfo: IPhysicalInformation[];
  doctorDiagnosis?: IDoctorDiagnosis;
  labResults: ILabResult[];
}

export interface IEmergencyContact {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  userId: string;
  user?: IUser; // Optional, for nested population
}

export interface IPhysicalInformation {
  id: string;
  name: string;
  diagnosis: string;
  phone: string;
  address: string;
  notes: string;
  userId: string;
  user?: IUser;
}

export interface IDoctorDiagnosis {
  id: string;
  knownMedicalConditions: string;
  allergies: string;
  userId: string;
  user?: IUser;
}

export interface ILabResult {
  id: string;
  message: string;
  doctorId: string;
  userId: string;
  createdAt: Date;
  doctor?: IAdmin;
  user?: IUser;
}

export interface IAdmin {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  labResults: ILabResult[];
}

export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  STAFF = "STAFF",
}
