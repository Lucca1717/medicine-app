export type UnitType = 'MASS' | 'VOLUME' | 'MEDICATION';
export type IntakeStatus = 'PENDING' | 'TAKEN' | 'SKIPPED' | 'OVERDUE';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
export interface UserRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UnitResponse {
  id: string;
  name: string;
  abbreviation: string;
  type: UnitType;
}
export interface UnitRequest {
  name: string;
  abbreviation: string;
  type: UnitType;
}

export interface MedicationResponse {
  id: string;
  name: string;
  dosageValue: number;
  dosageUnitId: string;
}
export interface MedicationRequest {
  name: string;
  dosageValue: number;
  dosageUnitId: string;
}

export interface PeriodResponse {
  id: string;
  userId: string;
  name: string;
  time: string;
}
export interface PeriodRequest {
  userId: string;
  name: string;
  time: string;
}

export interface UserMedicationResponse {
  id: string;
  userId: string;
  medicationId: string;
  currentStockValue: number;
  stockUnitId: string;
  startDate: string;
  endDate?: string | null;
  active: boolean;
}
export interface UserMedicationRequest {
  userId: string;
  medicationId: string;
  currentStockValue: number;
  stockUnitId: string;
  startDate: string;
  endDate?: string | null;
  active: boolean;
}

export interface MedicationPeriodResponse {
  id: string;
  userMedicationId: string;
  periodId: string;
  quantityValue: number;
  quantityUnitId: string;
}
export interface MedicationPeriodRequest {
  userMedicationId: string;
  periodId: string;
  quantityValue: number;
  quantityUnitId: string;
}

export interface IntakeRecordResponse {
  id: string;
  medicationPeriodId: string;
  scheduledAt: string;
  takenAt?: string | null;
  quantityValue?: number | null;
  quantityUnitId?: string | null;
  status: IntakeStatus;
}
export interface IntakeRecordRequest {
  medicationPeriodId: string;
  scheduledAt: string;
  takenAt?: string | null;
  quantityValue?: number | null;
  quantityUnitId?: string | null;
  status: IntakeStatus;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
