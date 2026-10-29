// Image files imported in code. Metro bundles each one as an asset and gives the import a
// numeric asset ID, which expo-image takes as a source. The SVGs are drawn by expo-image too,
// not turned into components.
declare module '*.png' {
  const assetId: number;
  export default assetId;
}

declare module '*.svg' {
  const assetId: number;
  export default assetId;
}
