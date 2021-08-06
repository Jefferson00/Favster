export function translateType(type: string) {
  let typeTranslated = type;
  switch (type) {
    case "artist":
      typeTranslated = "Artistas";
      break;
    case "album":
      typeTranslated = "Álbuns";
      break;
    case "track":
      typeTranslated = "Músicas";
      break;
    default:
      break;
  }
  return typeTranslated;
}