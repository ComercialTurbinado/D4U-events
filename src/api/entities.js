import { EventTypeOps, TaskOps, MaterialOps, SupplierOps, DepartmentOps, EventOps, EventTaskOps, EventMaterialOps, EventSupplierOps, TaskCategoryOps, MaterialCategoryOps, SupplierCategoryOps, DefaultTaskOps, DefaultMaterialOps, DefaultSupplierOps, TeamMemberOps, Entity } from './mongodb';
import { API_URL, cleanDataForApi } from './mongodb';

// Mock entities para desenvolvimento
const EventType = EventTypeOps;
const DefaultTask = DefaultTaskOps;
const DefaultMaterial = DefaultMaterialOps;
const DefaultSupplier = DefaultSupplierOps;
const Task = TaskOps;
const Material = MaterialOps;
const Supplier = SupplierOps;
const Promoter = new Entity('promoters');
const Influencer = new Entity('influencers');
const Department = DepartmentOps;
const Event = EventOps;
const EventTask = EventTaskOps;
const EventMaterial = EventMaterialOps;
const EventSupplier = EventSupplierOps;
const TaskCategory = TaskCategoryOps;
const MaterialCategory = MaterialCategoryOps;
const SupplierCategory = SupplierCategoryOps;
const TeamMember = TeamMemberOps;

// Mock auth
const User = {
  login: () => Promise.resolve({}),
  logout: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve({})
};

const EventUTM = new Entity('event-utms');

class EventInfluencer extends Entity {
  static collection = "event_influencers";

  static async list(filters = {}) {
    const data = await super.list(filters);
    // Popula os dados do influenciador
    for (const item of data) {
      if (item.influencer_id) {
        item.influencer = await Influencer.get(item.influencer_id);
      }
    }
    return data;
  }

  static async get(id) {
    const data = await super.get(id);
    if (data && data.influencer_id) {
      data.influencer = await Influencer.get(data.influencer_id);
    }
    return data;
  }
}

class EventPromoter extends Entity {
  static collection = "event_promoters";

  static async list(filters = {}) {
    const data = await super.list(filters);
    // Popula os dados do promoter
    for (const item of data) {
      if (item.promoter_id) {
        item.promoter = await Promoter.get(item.promoter_id);
      }
    }
    return data;
  }

  static async get(id) {
    const data = await super.get(id);
    if (data && data.promoter_id) {
      data.promoter = await Promoter.get(data.promoter_id);
    }
    return data;
  }
}

export {
  Event,
  EventType,
  EventTask,
  EventMaterial,
  EventSupplier,
  Task,
  Material,
  Supplier,
  EventInfluencer,
  Influencer,
  EventPromoter,
  Promoter,
  Department,
  TaskCategory,
  MaterialCategory,
  SupplierCategory,
  TeamMember,
  DefaultTask,
  DefaultMaterial,
  DefaultSupplier,
  User,
  EventUTM
};
