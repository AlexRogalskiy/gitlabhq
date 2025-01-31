import { GlDropdown, GlDropdownItem, GlListbox } from '@gitlab/ui';
import Vue from 'vue';
import { parseBoolean } from '~/lib/utils/common_utils';

export function parseAttributes(el) {
  const { items: itemsString, selected, right: rightString } = el.dataset;

  const items = JSON.parse(itemsString);
  const right = parseBoolean(rightString);

  const { className } = el;

  return { items, selected, right, className };
}

export function initListbox(el, { onChange } = {}) {
  if (!el) return null;

  const { items, selected, right, className } = parseAttributes(el);

  return new Vue({
    el,
    data() {
      return {
        selected,
      };
    },
    computed: {
      text() {
        return items.find(({ value }) => value === this.selected)?.text;
      },
    },
    render(h) {
      if (gon.features?.glListboxForSortDropdowns) {
        return h(GlListbox, {
          props: {
            items,
            right,
            selected: this.selected,
            toggleText: this.text,
          },
          class: className,
          on: {
            select: (selectedValue) => {
              this.selected = selectedValue;
              const selectedItem = items.find(({ value }) => value === selectedValue);

              if (typeof onChange === 'function') {
                onChange(selectedItem);
              }
            },
          },
        });
      }

      return h(
        GlDropdown,
        {
          props: {
            text: this.text,
            right,
          },
          class: className,
        },
        items.map((item) =>
          h(
            GlDropdownItem,
            {
              props: {
                isCheckItem: true,
                isChecked: this.selected === item.value,
              },
              on: {
                click: () => {
                  this.selected = item.value;

                  if (typeof onChange === 'function') {
                    onChange(item);
                  }
                },
              },
            },
            item.text,
          ),
        ),
      );
    },
  });
}
