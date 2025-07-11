import { relations } from "drizzle-orm/relations";
import { users, formConfig, formResponses } from "./schema";

export const formConfigRelations = relations(formConfig, ({one, many}) => ({
	user: one(users, {
		fields: [formConfig.userUuid],
		references: [users.uuid]
	}),
	formResponses_formConfigId: many(formResponses, {
		relationName: "formResponses_formConfigId_formConfig_id"
	}),
	formResponses_formConfigId: many(formResponses, {
		relationName: "formResponses_formConfigId_formConfig_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	formConfigs: many(formConfig),
}));

export const formResponsesRelations = relations(formResponses, ({one}) => ({
	formConfig_formConfigId: one(formConfig, {
		fields: [formResponses.formConfigId],
		references: [formConfig.id],
		relationName: "formResponses_formConfigId_formConfig_id"
	}),
	formConfig_formConfigId: one(formConfig, {
		fields: [formResponses.formConfigId],
		references: [formConfig.id],
		relationName: "formResponses_formConfigId_formConfig_id"
	}),
}));