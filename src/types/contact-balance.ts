/** Analiza contactului unui părinte cu copilul. */
export interface ParentContact {
  parentType: "tata" | "mama";
  /** Ultima zi (trecută) cu copilul, sau null. */
  lastContactDate: string | null;
  /** Zile de la ultimul contact (null dacă nu a existat niciodată). */
  daysSinceLastContact: number | null;
  /** Următoarea zi programată cu copilul, sau null. */
  nextContactDate: string | null;
  /** Zile până la următorul contact (null dacă nimic programat). */
  daysUntilNext: number | null;
  /**
   * Semnal discret de echilibru: a existat contact în trecut, dar pauza e mai mare
   * decât pragul ȘI nu e nimic programat curând. Sugerează risc de înstrăinare.
   */
  alert: boolean;
}

export interface ContactBalance {
  parents: ParentContact[];
  /** Pragul (zile) peste care o pauză e semnalată. */
  thresholdDays: number;
  anyAlert: boolean;
}
