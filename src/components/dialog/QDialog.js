import { QModal } from '../modal'
import { QInput } from '../input'
import { QBtn } from '../btn'
import { QOptionGroup } from '../option-group'
import clone from '../../utils/clone'

export default {
  name: 'q-dialog',
  props: {
    value: Boolean,
    title: String,
    message: String,
    prompt: Object,
    options: Object,
    ok: {
      type: [String, Boolean],
      default: true
    },
    cancel: [String, Boolean],
    stackButtons: Boolean,
    preventClose: Boolean,
    position: String,
    color: {
      type: String,
      default: 'primary'
    }
  },
  watch: {
    value (val) {
      this[val ? 'show' : 'hide']()
    }
  },
  render (h) {
    const
      child = [],
      title = this.$slots.title || this.title,
      msg = this.$slots.message || this.message

    if (title) {
      child.push(
        h('div', {
          staticClass: 'modal-header'
        }, [ title ])
      )
    }
    if (msg) {
      child.push(
        h('div', {
          staticClass: 'modal-body modal-scroll'
        }, [ msg ])
      )
    }

    child.push(
      h(
        'div',
        { staticClass: 'modal-body modal-scroll' },
        this.hasForm
          ? (this.prompt ? this.__getPrompt(h) : this.__getOptions(h))
          : [ this.$slots.default ]
      )
    )

    if (this.$scopedSlots.buttons) {
      child.push(
        h('div', {
          staticClass: 'modal-buttons',
          'class': {
            row: !this.stackButtons,
            column: this.stackButtons
          }
        }, [
          this.$scopedSlots.buttons({
            ok: this.__onOk,
            cancel: this.__onCancel
          })
        ])
      )
    }
    else if (this.ok || this.cancel) {
      child.push(
        h(
          'div',
          { staticClass: 'modal-buttons row' },
          this.__getButtons(h)
        )
      )
    }

    return h(QModal, {
      ref: 'modal',
      props: {
        minimized: true,
        noBackdropDismiss: this.preventClose,
        noEscDismiss: this.preventClose,
        position: this.position
      },
      on: {
        show: () => {
          this.$emit('show')
          this.$emit('input', true)
        },
        hide: () => {
          this.$emit('hide')
          this.$emit('input', false)
        },
        dismiss: () => {
          console.log('DIALOG received dismiss, hiding then emitting cancel')
          this.$emit('cancel')
        },
        'escape-key': () => {
          this.hide().then(() => {
            this.$emit('escape-key')
            this.$emit('cancel')
          })
        }
      }
    }, child)
  },
  computed: {
    hasForm () {
      return this.prompt || this.options
    },
    okLabel () {
      return this.ok === true
        ? 'OK'
        : this.ok
    },
    cancelLabel () {
      return this.cancel === true
        ? 'Cancel'
        : this.cancel
    }
  },
  methods: {
    show () {
      console.log('DIALOG show')
      return this.$refs.modal.show().then(() => {
        console.log('DIALOG show emitting show')

        if (!this.$q.platform.is.desktop) {
          return
        }

        let node = this.$refs.modal.$el.getElementsByTagName('INPUT')
        if (node.length) {
          node[0].focus()
          return
        }

        node = this.$refs.modal.$el.getElementsByTagName('INPUT')
        if (node.length) {
          node[node.length - 1].focus()
        }
      })
    },
    hide () {
      let data

      if (this.hasForm) {
        data = clone(this.__getData())
      }
      console.log('DIALOG hide')

      return this.$refs.modal.hide().then(() => {
        console.log('DIALOG hide', data)
        return data
      })
    },
    __getPrompt (h) {
      return [
        h(QInput, {
          style: 'margin-bottom: 10px',
          props: {
            value: this.prompt.model,
            type: this.prompt.type || 'text',
            color: this.color,
            noPassToggle: true
          },
          on: {
            change: v => { this.prompt.model = v }
          }
        })
      ]
    },
    __getOptions (h) {
      return [
        h(QOptionGroup, {
          props: {
            value: this.options.model,
            type: this.options.type,
            color: this.color,
            inline: this.options.inline,
            options: this.options.items
          },
          on: {
            change: v => { this.options.model = v }
          }
        })
      ]
    },
    __getButtons (h) {
      const child = []

      if (this.cancel) {
        child.push(h(QBtn, {
          props: { color: this.color, flat: true, label: this.cancelLabel },
          on: { click: this.__onCancel }
        }))
      }
      if (this.ok) {
        child.push(h(QBtn, {
          props: { color: this.color, flat: true, label: this.okLabel },
          on: { click: this.__onOk }
        }))
      }

      return child
    },
    __onOk () {
      return this.hide().then(data => {
        console.log('DIALOG emitting ok', data)
        this.$emit('ok', data)
      })
    },
    __onCancel () {
      return this.hide().then(() => {
        console.log('DIALOG emitting cancel')
        this.$emit('cancel')
      })
    },
    __getData () {
      if (this.prompt) {
        return this.prompt.model
      }
      if (this.options) {
        return this.options.model
      }
    }
  }
}
