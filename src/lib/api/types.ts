import type { ContactReason } from "../../config";

export type Role = "admin" | "artist";
export interface Session {
  email: string;
  role: Role;
  artistId: string | null;
}

/** "welcome": alta correcta y la automatización de bienvenida ha enviado su email */
export type SubscribeResult = "ok" | "welcome" | "dup" | "invalid";
export type SubscriberSource = "web" | "concierto" | "importado" | "manual";
export interface Subscriber {
  id: string;
  email: string;
  name: string;
  source: SubscriberSource;
  status: "active" | "unsubscribed";
  createdAt: string;
}

export interface Campaign {
  id: string;
  subject: string;
  sentAt: string;
  sent: number;
  opens: number;
  clicks: number;
}
export interface CampaignInput {
  subject: string;
  preheader: string;
  body: string;
  cta: string;
  url: string;
  sent: number;
  opens: number;
  clicks: number;
}

export type AutomationKey = "welcome" | "release";
export interface Automation {
  key: AutomationKey;
  enabled: boolean;
  sent: number;
}
export interface AutomationLog {
  id: string;
  key: AutomationKey;
  text: string;
  at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  reason: ContactReason;
  message: string;
  read: boolean;
  createdAt: string;
}
export type ContactInput = Pick<ContactMessage, "name" | "email" | "reason" | "message">;

export type ContractType = "recording" | "distribution" | "publishing";
export interface ClientInfo {
  browser: string;
  os: string;
  language: string;
  timezone: string;
  utcOffset: string;
  screen: string;
}
export interface Signature {
  name: string;
  signedAt: string; // ISO 8601 UTC
  ip: string;
  ipSource: string;
  userAgent: string;
  hash: string;
  algo: string;
  docId: string;
  image: string; // data URL PNG
  client: ClientInfo;
}
export interface Contract {
  id: string;
  artistId: string;
  title: string;
  type: ContractType;
  scope: string;
  start: string; // yyyy-mm-dd
  end: string;
  royalties: number;
  territory: string;
  advance: number;
  status: "pending" | "signed";
  signedOn: string | null;
  signedNote: string | null;
  signature: Signature | null;
}

export type ContractEventType = "sent" | "opened" | "read" | "signed";
export interface ContractEvent {
  id: string;
  contractId: string;
  event: ContractEventType;
  detail: string;
  at: string;
}

export interface SignInput {
  contractId: string;
  fullName: string;
  image: string;
  documentText: string;
  client: ClientInfo;
}

/** Todo lo que la web necesita del backend. Hay dos implementaciones: Supabase y localStorage. */
export interface Api {
  mode: "supabase" | "local";

  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;

  // Público
  subscribe(email: string): Promise<SubscribeResult>;
  sendContactMessage(input: ContactInput): Promise<void>;

  // Admin
  listSubscribers(): Promise<Subscriber[]>;
  addSubscriber(email: string, name: string): Promise<SubscribeResult>;
  importSubscribers(rows: { email: string; name: string }[]): Promise<{ ok: number; dup: number; added: string[] }>;
  deleteSubscriber(id: string): Promise<void>;
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(input: CampaignInput): Promise<void>;
  listAutomations(): Promise<Record<AutomationKey, Automation>>;
  setAutomation(key: AutomationKey, enabled: boolean): Promise<void>;
  runAutomation(key: AutomationKey, text: string): Promise<void>;
  listAutomationLog(): Promise<AutomationLog[]>;
  listMessages(): Promise<ContactMessage[]>;
  markMessageRead(id: string): Promise<void>;
  deleteMessage(id: string): Promise<void>;

  // Portal de artistas
  listContracts(): Promise<Contract[]>;
  listContractEvents(contractId: string): Promise<ContractEvent[]>;
  logContractEvent(contractId: string, event: "opened" | "read", detail: string): Promise<void>;
  signContract(input: SignInput): Promise<Signature>;

  resetDemo(): Promise<void>;
}
