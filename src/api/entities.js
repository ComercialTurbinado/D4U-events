import { EventTypeOps, TaskOps, MaterialOps, SupplierOps, DepartmentOps, EventOps, EventTaskOps, EventMaterialOps, EventSupplierOps, TaskCategoryOps, MaterialCategoryOps, SupplierCategoryOps, DefaultTaskOps, DefaultMaterialOps, DefaultSupplierOps, TeamMemberOps, Entity } from './mongodb';
import { API_URL, cleanDataForApi } from './mongodb';

// Mock entities para desenvolvimento
export const EventType = EventTypeOps;

export const DefaultTask = DefaultTaskOps;
export const DefaultMaterial = DefaultMaterialOps;
export const DefaultSupplier = DefaultSupplierOps;

export const Task = TaskOps;
export const Material = MaterialOps;
export const Supplier = SupplierOps;
export const Department = DepartmentOps;
export const Event = EventOps;
export const EventTask = EventTaskOps;
export const EventMaterial = EventMaterialOps;
export const EventSupplier = EventSupplierOps;
export const TaskCategory = TaskCategoryOps;
export const MaterialCategory = MaterialCategoryOps;
export const SupplierCategory = SupplierCategoryOps;
export const TeamMember = TeamMemberOps;

// Mock auth
export const User = {
  login: () => Promise.resolve({}),
  logout: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve({})
};

export const EventUTM = new Entity('event-utms');
