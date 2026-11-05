/** The marks in a labelled grid, `cols` across (8), light on dark, as a PNG. */
export function gridSheet(marks: readonly { name: string; svg: string }[], o?: { cols?: number }): Promise<Uint8Array>;
