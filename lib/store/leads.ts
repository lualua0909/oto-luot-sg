import { adminDeleteLead, adminGetAllLeads, adminUpdateLeadStatus, submitLeadAction } from "@/lib/actions";
import type { LeadInput } from "@/lib/data/leads";
import type { Lead } from "@/lib/types";
import { idToken } from "./session";
export type { LeadInput } from "@/lib/data/leads";

/** Public contact form. */
export const submitLead = (input: LeadInput) => submitLeadAction(input);
export const getAllLeadsAdmin = async () => adminGetAllLeads(await idToken());
export const updateLeadStatus = async (id: string, status: Lead["status"]) => adminUpdateLeadStatus(await idToken(), id, status);
export const deleteLead = async (id: string) => adminDeleteLead(await idToken(), id);
