import type { Ref } from "../dep.ts";

export type BooleanLike = boolean | 1 | "1" | "" | 0;

export type MaybeComputed<T> = Ref<T> | T;

export type MaybeRef<T> = Ref<T> | T;
