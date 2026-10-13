import { describe, expect, test } from "bun:test";
import { avecNotes, categories, cles, mots, nettoyer, normaliser, parId, trouver, type Mot } from "../src/index";

// Fixed entries, so the tests do not depend on what glossaire.json holds today.
const m = (id: string, mot: string): Mot => ({ id, mot, cat: "Test", def: `déf ${id}`, sources: [], statut: "à sourcer" });
const LISTE = [
  m("amendement", "Amendement"),
  m("sous-amendement", "Sous-amendement"),
  m("49-3", "Article 49.3"),
  m("tva", "TVA (taxe sur la valeur ajoutée)"),
  m("cmp", "Commission mixte paritaire (CMP)"),
  m("hemicycle", "Hémicycle"),
  m("discipline", "Discipline (de groupe)"),
];

describe("normaliser", () => {
  test("lowercase, no accents", () => expect(normaliser("Hémicycle ÉLU")).toBe("hemicycle elu"));
});

describe("nettoyer", () => {
  test("quotes and punctuation", () => {
    expect(nettoyer(" « TVA ». ")).toBe("TVA");
    expect(nettoyer("(amendement)")).toBe("amendement");
  });
  test("keeps a parenthesis that closes one", () => expect(nettoyer("Accord (entre groupes).")).toBe("Accord (entre groupes)"));
});

describe("trouver", () => {
  const id = (w: string) => trouver(w, LISTE)?.id;
  test("name, any case, accents", () => {
    expect(id("amendement")).toBe("amendement");
    expect(id("HEMICYCLE")).toBe("hemicycle");
  });
  test("plural in s", () => expect(id("amendements")).toBe("amendement"));
  test("acronym and expansion in parenthesis", () => {
    expect(id("TVA")).toBe("tva");
    expect(id("taxe sur la valeur ajoutée")).toBe("tva");
    expect(id("CMP")).toBe("cmp");
    expect(id("Commission mixte paritaire")).toBe("cmp");
  });
  test("name without parenthesis", () => expect(id("discipline")).toBe("discipline"));
  test("49.3 and 49-3", () => {
    expect(id("49.3")).toBe("49-3");
    expect(id("49-3")).toBe("49-3");
    expect(id("article 49.3")).toBe("49-3");
  });
  test("surrounding quotes and punctuation", () => expect(id("« amendement »,")).toBe("amendement"));
  test("no loose match", () => {
    expect(id("taxe")).toBeUndefined();
    expect(id("amende")).toBeUndefined();
    expect(id("")).toBeUndefined();
    expect(id("  ")).toBeUndefined();
  });
  test("exact beats containment", () => expect(id("sous-amendement")).toBe("sous-amendement"));
});

describe("parId", () => {
  test("found / not found", () => {
    expect(parId("tva", LISTE)?.mot).toBe("TVA (taxe sur la valeur ajoutée)");
    expect(parId("TVA", LISTE)).toBeUndefined();
  });
});

describe("avecNotes", () => {
  type Note = { site?: string; ex?: string };
  test("adds notes by id, keeps the rest untouched", () => {
    const v = avecNotes<Note>({ tva: { site: "sur le site", ex: "exemple" } }, () => {}, LISTE);
    expect(v.parId("tva")).toMatchObject({ id: "tva", def: "déf tva", site: "sur le site", ex: "exemple" });
    expect(v.parId("cmp")?.site).toBeUndefined();
    expect(v.mots.length).toBe(LISTE.length);
    expect(v.trouver("TVA")?.site).toBe("sur le site");
    expect(LISTE.find((x) => x.id === "tva")).not.toHaveProperty("site");
  });
  test("reports unknown ids", () => {
    const inconnus: string[] = [];
    avecNotes<Note>({ tva: { site: "a" }, inexistant: { site: "b" } }, (id) => inconnus.push(id), LISTE);
    expect(inconnus).toEqual(["inexistant"]);
  });
  test("warns on the console by default", () => {
    const warn = console.warn, vus: unknown[] = [];
    console.warn = (...a: unknown[]) => vus.push(a.join(" "));
    try { avecNotes({ inexistant: { site: "b" } }, undefined, LISTE); } finally { console.warn = warn; }
    expect(String(vus[0])).toContain("inexistant");
  });
});

// Whatever glossaire.json holds: every entry is reachable by id and by its own name.
describe("glossaire.json", () => {
  test("has entries and categories", () => {
    expect(mots.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
  });
  test("every entry is found by id and by name", () => {
    for (const x of mots) {
      expect(parId(x.id)).toBe(x);
      expect(cles(x).length).toBeGreaterThan(0);
      expect(trouver(x.mot)?.id).toBe(x.id);
    }
  });
});
