/**
 * ColumnBlock extension for TipTap
 * Container node that holds multiple columns
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export interface ColumnBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnBlock: {
      /**
       * Add a column block
       */
      setColumnBlock: (position?: number) => ReturnType;
      /**
       * Toggle a column block
       */
      toggleColumnBlock: () => ReturnType;
    };
  }
}

export const ColumnBlock = Node.create<ColumnBlockOptions>({
  name: 'columnBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'column{2}', // Exactly 2 columns for now

  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: element => element.getAttribute('data-columns'),
        renderHTML: attributes => {
          return {
            'data-columns': attributes.columns,
          };
        },
      },
      layout: {
        default: '50-50',
        parseHTML: element => element.getAttribute('data-layout') || '50-50',
        renderHTML: attributes => {
          return {
            'data-layout': attributes.layout,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-column-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-column-block': '',
        class: 'column-block',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumnBlock:
        (position?: number) =>
        ({ chain, state }) => {
          const { selection } = state;
          const pos = position !== undefined ? position : selection.head;

          return chain()
            .insertContentAt(pos, {
              type: this.name,
              content: [
                {
                  type: 'column',
                  content: [
                    {
                      type: 'paragraph',
                      content: [],
                    },
                  ],
                },
                {
                  type: 'column',
                  content: [
                    {
                      type: 'paragraph',
                      content: [],
                    },
                  ],
                },
              ],
            })
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                // Move cursor to the first paragraph in the first column
                const insertedPos = pos + 1; // Position after columnBlock node
                const firstParagraphPos = insertedPos + 1; // Position inside first column's paragraph
                tr.setSelection(TextSelection.near(tr.doc.resolve(firstParagraphPos)));
              }
              return true;
            })
            .run();
        },

      toggleColumnBlock:
        () =>
        ({ chain }) => {
          return chain().toggleNode('columnBlock', 'paragraph').run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.setColumnBlock(),
      Tab: () => {
        // Handle tab navigation between columns
        const { state, view } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're inside a column
        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type.name === 'column') {
            const parent = $from.node(depth - 1);
            
            // Find current column index
            let columnIndex = 0;
            parent.forEach((_node, _offset, index) => {
              if ($from.before(depth) === $from.before(depth - 1) + _offset + 1) {
                columnIndex = index;
              }
            });

            // Move to next column if exists
            if (columnIndex < parent.childCount - 1) {
              const nextColumnPos = $from.after(depth);
              const targetPos = nextColumnPos + 1;
              
              view.dispatch(
                state.tr.setSelection(
                  TextSelection.near(state.doc.resolve(targetPos))
                )
              );
              return true;
            }
          }
          depth--;
        }
        return false;
      },
      'Shift-Tab': () => {
        // Handle shift-tab navigation between columns (backwards)
        const { state, view } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're inside a column
        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type.name === 'column') {
            const parent = $from.node(depth - 1);
            
            // Find current column index
            let columnIndex = 0;
            parent.forEach((_node, _offset, index) => {
              if ($from.before(depth) === $from.before(depth - 1) + _offset + 1) {
                columnIndex = index;
              }
            });

            // Move to previous column if exists
            if (columnIndex > 0) {
              const prevColumnPos = $from.before(depth - 1) + 1;
              let targetPos = prevColumnPos;
              
              // Calculate position of previous column
              for (let i = 0; i < columnIndex - 1; i++) {
                targetPos += parent.child(i).nodeSize;
              }
              
              view.dispatch(
                state.tr.setSelection(
                  TextSelection.near(state.doc.resolve(targetPos + 1))
                )
              );
              return true;
            }
          }
          depth--;
        }
        return false;
      },
    };
  },
});