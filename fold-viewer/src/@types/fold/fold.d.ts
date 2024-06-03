type FOLDFrame = {
  frame_author?: string;
  frame_title?: string;
  frame_description?: string;
  frame_classes?: string[];
  frame_attributes?: string[];
  frame_unit?: string;
  vertices_coords?: [number, number][] | [number, number, number][];
  vertices_vertices?: number[][];
  vertices_edges?: number[][];
  vertices_faces?: (number | null | undefined)[][];
  edges_vertices?: [number, number][];
  edges_faces?: (number | null | undefined)[][];
  edges_assignment?: string[];
  edges_foldAngle?: number[];
  edges_length?: number[];
  faces_vertices?: number[][];
  faces_edges?: number[][];
  faces_faces?: (number | null | undefined)[][];
  faceOrders?: [number, number, number][];
  edgeOrders?: [number, number, number][];
};

type FOLDChildFrame = FOLDFrame & {
  frame_parent?: number;
  frame_inherit?: boolean;
};

type FOLD = FOLDFrame & {
  file_spec?: number;
  file_creator?: string;
  file_author?: string;
  file_title?: string;
  file_description?: string;
  file_classes?: string[];
  file_frames?: FOLDChildFrame[];
};

declare module "fold/lib/convert.js" {

  const convert: {
    // todo: make types more specific
    edges_vertices_to_vertices_vertices_unsorted: (fold: FOLDFrame) => FOLDFrame,
    edges_vertices_to_vertices_edges_unsorted: (fold: FOLDFrame) => FOLDFrame,
    edges_vertices_to_vertices_vertices_sorted: (fold: FOLDFrame) => FOLDFrame,
    edges_vertices_to_vertices_edges_sorted: (fold: FOLDFrame) => FOLDFrame,
    sort_vertices_vertices: (fold: FOLDFrame) => FOLDFrame,
    vertices_vertices_to_faces_vertices: (fold: FOLDFrame) => FOLDFrame,
    vertices_edges_to_faces_vertices_edges: (fold: FOLDFrame) => FOLDFrame,
    edges_vertices_to_faces_vertices: (fold: FOLDFrame) => FOLDFrame,
    edges_vertices_to_faces_vertices_edges: (fold: FOLDFrame) => FOLDFrame,
    vertices_vertices_to_vertices_edges: (fold: FOLDFrame) => FOLDFrame,
    faces_vertices_to_faces_edges: (fold: FOLDFrame) => FOLDFrame,
  };

  export = convert;
}

declare module "fold/lib/geom.js" {
  type Vector = [number, number];
  type Face = {
    visited: boolean,
    parent: Face | null,
    children: [Face]
  }

  const geom: {
    EPS: 0.000001,
    sum: (a: number, b: number) => number,
    min: (a: number, b: number) => number,
    max: (a: number, b: number) => number,
    all: (a: boolean, b: boolean) => boolean,
    next: (start: number, a: number, i?: number) => number,

    rangeDisjoint: (a: Vector, b: Vector) => boolean,
    topologicalSort: (vs: Face[]) => Face[],
    visit: (face: Face, list: Face[]) => Face[],

    magsq: (a: Vector) => number,
    mag: (a: Vector) => number,
    unit: (a: Vector, eps?: number) => Vector | null,
  };
  export = geom;
}