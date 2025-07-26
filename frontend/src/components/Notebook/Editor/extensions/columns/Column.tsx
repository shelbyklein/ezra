/**
 * Column extension for TipTap
 * Individual column node within a ColumnBlock
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnOptions {
  HTMLAttributes: Record<string, any>;
}

export const Column = Node.create<ColumnOptions>({
  name: 'column',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'block+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      width: {
        default: '50%',
        parseHTML: element => element.getAttribute('data-width') || '50%',
        renderHTML: attributes => {
          return {
            'data-width': attributes.width,
          };
        },
      },
      verticalAlign: {
        default: 'top',
        parseHTML: element => element.getAttribute('data-vertical-align') || 'top',
        renderHTML: attributes => {
          return {
            'data-vertical-align': attributes.verticalAlign,
          };
        },
      },
      horizontalAlign: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-horizontal-align') || 'left',
        renderHTML: attributes => {
          return {
            'data-horizontal-align': attributes.horizontalAlign,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-column]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const alignmentClasses = [
      'column',
      `column-v-${node.attrs.verticalAlign}`,
      `column-h-${node.attrs.horizontalAlign}`,
    ].join(' ');

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-column': '',
        class: alignmentClasses,
      }),
      0,
    ];
  },
});