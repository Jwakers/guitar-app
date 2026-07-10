/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as devReset from "../devReset.js";
import type * as exercises from "../exercises.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_exerciseValidators from "../lib/exerciseValidators.js";
import type * as lib_logExerciseResult from "../lib/logExerciseResult.js";
import type * as lib_provisionTraining from "../lib/provisionTraining.js";
import type * as lib_sessionLifecycle from "../lib/sessionLifecycle.js";
import type * as lib_sessionValidators from "../lib/sessionValidators.js";
import type * as lib_upsertExercise from "../lib/upsertExercise.js";
import type * as onboarding from "../onboarding.js";
import type * as sessions from "../sessions.js";
import type * as skills from "../skills.js";
import type * as trainingBlocks from "../trainingBlocks.js";
import type * as users from "../users.js";
import type * as weeklyPlans from "../weeklyPlans.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  devReset: typeof devReset;
  exercises: typeof exercises;
  "lib/auth": typeof lib_auth;
  "lib/exerciseValidators": typeof lib_exerciseValidators;
  "lib/logExerciseResult": typeof lib_logExerciseResult;
  "lib/provisionTraining": typeof lib_provisionTraining;
  "lib/sessionLifecycle": typeof lib_sessionLifecycle;
  "lib/sessionValidators": typeof lib_sessionValidators;
  "lib/upsertExercise": typeof lib_upsertExercise;
  onboarding: typeof onboarding;
  sessions: typeof sessions;
  skills: typeof skills;
  trainingBlocks: typeof trainingBlocks;
  users: typeof users;
  weeklyPlans: typeof weeklyPlans;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
