import type { Feature, LineString, MultiLineString, Point } from "geojson";

export type Station = Feature<
  Point,
  {
    id: string;
    name: string;
    long_name?: string | undefined;
    short_name?: string | undefined;
    line: string;
  }
> & { id: number };

export type Track = Feature<
  LineString | MultiLineString,
  { color: string; line: string } & Record<string, string>
>;

export type Line = {
  name: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  order: number;
};

export type LineWithCode = {
  k: string;
  v: Line;
};

export type DataFile = {
  lines: LineWithCode[];
  stations: Station[];
  tracks: Track[];
};
