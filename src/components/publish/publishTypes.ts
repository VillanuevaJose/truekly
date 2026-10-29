import type { Category, Condition } from "../../data/mockProducts";

export interface PublishFormData {
  title: string;
  category: Category;
  condition: Condition;
  wantsInReturn: string;
  description: string;
  zone: string;
  safePointRecommended: string;
  photos: string[];
}

export const CATEGORY_OPTIONS: { id: Category; label: string; icon: string }[] = [
  { id: "Tecnología", label: "Tecnología", icon: "Laptop" },
  { id: "Gaming", label: "Gaming", icon: "Gamepad2" },
  { id: "Música", label: "Música", icon: "Music2" },
  { id: "Hogar", label: "Hogar", icon: "Home" },
  { id: "Deportes", label: "Deportes", icon: "Dumbbell" },
  { id: "Otros", label: "Otros", icon: "Package" },
];

export const CONDITION_OPTIONS: { id: Condition; label: string; hint: string }[] = [
  { id: "Nuevo", label: "Nuevo", hint: "En caja sellada o sin uso alguno" },
  { id: "Como nuevo", label: "Como nuevo", hint: "Uso mínimo, estética 10/10" },
  { id: "Buen estado", label: "Buen estado", hint: "Funciona perfecto, marcas leves de uso" },
  { id: "Usado", label: "Usado", hint: "Totalmente operativo con desgaste visible" },
];

export const INITIAL_FORM_DATA: PublishFormData = {
  title: "",
  category: "Tecnología",
  condition: "Buen estado",
  wantsInReturn: "",
  description: "",
  zone: "Casco Urbano",
  safePointRecommended: "MegaPlaza Chimbote (Zona Bancaria)",
  photos: [],
};
