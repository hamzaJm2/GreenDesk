export interface PackagingColorGroup {
  id: number;
  svgGroupId: string;
  label: string;
  defaultColorHex: string | null;
}

export interface PackagingLogoZone {
  id: number;
  svgGroupId: string;
  label: string;
}

export interface PackagingTemplateSummary {
  id: number;
  productId: number;
  name: string;
  colorGroupCount: number;
  logoZoneCount: number;
  active: boolean;
}

export interface PackagingTemplateResponse {
  id: number;
  productId: number;
  productName?: string;
  name: string;
  svgFlatContent: string;
  svgPerspectiveContent: string | null;
  viewBoxWidth: number;
  viewBoxHeight: number;
  active: boolean;
  colorGroups: PackagingColorGroup[];
  logoZones: PackagingLogoZone[];
}

export interface PackagingCustomization {
  packagingTemplateId: number;
  colors: Record<string, string>;
  logos: Record<string, string>;
}
