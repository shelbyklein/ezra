/**
 * Column commands and utilities
 */

import { Editor } from '@tiptap/core';

export const setColumnLayout = (editor: Editor, layout: string) => {
  const { state, view } = editor;
  const { selection } = state;
  const { $from } = selection;

  // Find the columnBlock node
  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type.name === 'columnBlock') {
      const pos = $from.before(depth);
      
      // Update the layout attribute
      view.dispatch(
        state.tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          layout,
        })
      );
      
      // Update column widths based on layout
      const [leftWidth, rightWidth] = getColumnWidths(layout);
      
      // Update first column
      const firstColumnPos = pos + 1;
      view.dispatch(
        state.tr.setNodeMarkup(firstColumnPos, undefined, {
          width: leftWidth,
        })
      );
      
      // Update second column
      const firstColumn = node.child(0);
      const secondColumnPos = firstColumnPos + firstColumn.nodeSize;
      view.dispatch(
        state.tr.setNodeMarkup(secondColumnPos, undefined, {
          width: rightWidth,
        })
      );
      
      return true;
    }
    depth--;
  }
  return false;
};

export const getColumnWidths = (layout: string): [string, string] => {
  switch (layout) {
    case '70-30':
      return ['70%', '30%'];
    case '30-70':
      return ['30%', '70%'];
    case '60-40':
      return ['60%', '40%'];
    case '40-60':
      return ['40%', '60%'];
    case '50-50':
    default:
      return ['50%', '50%'];
  }
};

export const deleteColumnBlock = (editor: Editor) => {
  const { state, view } = editor;
  const { selection } = state;
  const { $from } = selection;

  // Find the columnBlock node
  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type.name === 'columnBlock') {
      const pos = $from.before(depth);
      const endPos = $from.after(depth);
      
      // Delete the entire columnBlock
      view.dispatch(
        state.tr.delete(pos, endPos)
      );
      
      return true;
    }
    depth--;
  }
  return false;
};

export const isInColumn = (editor: Editor): boolean => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  let depth = $from.depth;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'column') {
      return true;
    }
    depth--;
  }
  return false;
};

export const isInColumnBlock = (editor: Editor): boolean => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  let depth = $from.depth;
  while (depth > 0) {
    if ($from.node(depth).type.name === 'columnBlock') {
      return true;
    }
    depth--;
  }
  return false;
};

export const setColumnAlignment = (
  editor: Editor, 
  columnIndex: number, 
  verticalAlign?: 'top' | 'center' | 'bottom',
  horizontalAlign?: 'left' | 'center' | 'right'
) => {
  const { state, view } = editor;
  const { selection } = state;
  const { $from } = selection;

  // Find the columnBlock node
  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type.name === 'columnBlock') {
      const pos = $from.before(depth);
      
      // Find the column position
      let columnPos = pos + 1;
      for (let i = 0; i < columnIndex && i < node.childCount; i++) {
        columnPos += node.child(i).nodeSize;
      }
      
      if (columnIndex < node.childCount) {
        const column = node.child(columnIndex);
        const attrs = { ...column.attrs };
        
        if (verticalAlign !== undefined) {
          attrs.verticalAlign = verticalAlign;
        }
        if (horizontalAlign !== undefined) {
          attrs.horizontalAlign = horizontalAlign;
        }
        
        view.dispatch(
          state.tr.setNodeMarkup(columnPos, undefined, attrs)
        );
      }
      
      return true;
    }
    depth--;
  }
  return false;
};

export const getCurrentColumnIndex = (editor: Editor): number => {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  let depth = $from.depth;
  while (depth > 0) {
    const node = $from.node(depth);
    if (node.type.name === 'column') {
      const parent = $from.node(depth - 1);
      if (parent.type.name === 'columnBlock') {
        // Find current column index
        let columnIndex = 0;
        parent.forEach((_node, _offset, index) => {
          if ($from.before(depth) === $from.before(depth - 1) + _offset + 1) {
            columnIndex = index;
          }
        });
        return columnIndex;
      }
    }
    depth--;
  }
  return -1;
};