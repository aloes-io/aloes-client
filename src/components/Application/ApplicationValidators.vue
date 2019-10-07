<template lang="html">
  <div v-show="validatorsOptions.length > 0">
    <b-row v-for="option in validatorsOptions" :key="option">
      <b-col v-if="option && (option.startsWith('+') || option.startsWith('#'))" cols="12" sm="12">
        {{ formatField(option) }} :
        <b-input-group
          v-for="(validator, index) in validators[formatField(option)]"
          :key="index"
          :prepend="validatorType(option.charAt(0))"
          size="sm"
        >
          <b-input-group-prepend>
            <b-form-select
              v-model="validator.transformation"
              :options="validatorTransformations(option.charAt(0))"
              size="sm"
              class="form-input-validators"
            />
            <b-form-select
              v-model="validator.operation"
              :options="validatorOperations(option.charAt(0))"
              size="sm"
              class="form-input-validators"
              required
            />
          </b-input-group-prepend>
          <b-form-input
            v-if="validator.operation === 'typeof'"
            v-model="validator.value"
            size="sm"
            placeholder="select value in the list"
            list="validator-operations-list"
          />
          <b-form-input
            v-else-if="validator.operation === 'length'"
            v-model="validator.value"
            size="sm"
            type="number"
            placeholder="parameter length"
          />
          <b-form-input
            v-else-if="validator.operation"
            v-model="validator.value"
            size="sm"
            autocomplete="off"
            :placeholder="`${formatField(option)}1 | ${formatField(option)}2 ...`"
          />
          <b-input-group-append>
            <b-button
              size="sm"
              variant="outline-success"
              @click.prevent.stop="addValidator(validator, index)"
              >+
            </b-button>
            <b-button
              v-if="validator.registered"
              size="sm"
              variant="outline-success"
              @click.prevent.stop="removeValidator(validator, index)"
              >-
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <datalist id="validator-operations-list">
      <option>string</option>
      <option v-for="elem in validatorTypeOf" :key="elem">{{ elem }}</option>
    </datalist>
  </div>
</template>

<script type="text/javascript">
import {
  BButton,
  BFormInput,
  BFormSelect,
  BInputGroup,
  BInputGroupAppend,
  BInputGroupPrepend,
} from 'bootstrap-vue';

export default {
  name: 'ApplicationValidators',

  components: {
    'b-button': BButton,
    'b-form-input': BFormInput,
    'b-form-select': BFormSelect,
    'b-input-group': BInputGroup,
    'b-input-group-append': BInputGroupAppend,
    'b-input-group-prepend': BInputGroupPrepend,
  },

  props: {
    'is-viewer': {
      type: Boolean,
      default: true,
    },
    'edit-mode': {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      viewer: true,
      editorMode: false,
      validatorsOptions: [],
      validatorTypeOf: ['string', 'number', 'array', 'object', 'boolean'],
    };
  },

  computed: {
    validators: {
      get() {
        return this.$store.state.application.instance.validators;
      },
      set(value) {
        this.$store.commit('application/setModelKV', {
          key: 'validators',
          value,
        });
      },
    },
  },

  watch: {
    isViewer: {
      handler(state) {
        this.viewer = state;
      },
      immediate: true,
    },
    editMode: {
      handler(mode) {
        this.editorMode = mode;
      },
      immediate: true,
    },
    validatorsOption: {
      handler(option) {
        this.option = option;
      },
      immediate: true,
    },
  },

  mounted() {},

  methods: {
    setValidatorsOptions(newValue, oldValue) {
      if (newValue && newValue !== null) {
        const separator = '/';
        const patternParamsKeys = newValue.split(separator);
        this.validatorsOptions = patternParamsKeys.filter((key, index) => {
          if (index > 0) {
            return key;
          }
          return false;
        });
        let oldValidatorsOptions = [];
        if (oldValue && oldValue !== null) {
          oldValidatorsOptions = oldValue.split(separator).filter((key, index) => {
            if (index > 0) {
              return key;
            }
            return false;
          });
        }
        const validators = JSON.parse(JSON.stringify(this.validators));
        //  console.log('options', this.validatorsOptions, oldValidatorsOptions);
        const changes = this.validatorsOptions.map((key, index) => {
          if (!oldValidatorsOptions[index]) {
            return {
              newValue: key,
              oldValue: key,
            };
          } else if (key !== oldValidatorsOptions[index]) {
            return {
              newValue: key,
              oldValue: oldValidatorsOptions[index],
            };
          }
        });
        changes.forEach(change => {
          if (!change || !change.newValue || !change.oldValue) return null;
          const newKey = this.formatField(change.newValue);
          const oldKey = this.formatField(change.oldValue);
          if (!validators[oldKey] || validators[oldKey] === null) {
            validators[newKey] = [
              {
                field: change.newValue,
                value: null,
                transformation: null,
                operation: null,
                registered: false,
              },
            ];
            //  console.log('validators1', validators[newKey]);
          } else {
            validators[oldKey].forEach(validator => {
              validator.field = change.newValue;
              return validator;
            });
            validators[newKey] = validators[oldKey];
            delete validators[oldKey];
            //  console.log('validators2', validators[newKey]);
          }
        });
        this.validators = validators;
        //  console.log('validators', validators);
        //  console.log('patternParamsKeys', this.validatorsOptions);
        return this.validators;
      }
      this.validators = {};
      return null;
    },

    validatorType(patternType) {
      if (patternType === '#') {
        return 'Array';
      } else if (patternType === '+') {
        return 'String';
      }
      return null;
    },

    validatorTransformations(patternType) {
      if (patternType === '#') {
        return [
          { value: null, text: 'Transform', disabled: true },
          { value: 'lowercase', text: 'lowercase' },
          { value: 'uppercase', text: 'uppercase' },
        ];
      } else if (patternType === '+') {
        return [
          { value: null, text: 'Transform', disabled: true },
          { value: 'lowercase', text: 'lowercase' },
          { value: 'uppercase', text: 'uppercase' },
        ];
      }
      return null;
    },

    validatorOperations(patternType) {
      if (patternType === '#') {
        return [
          { value: null, text: 'Operations', disabled: true },
          { value: 'includes', text: 'includes' },
          { value: 'length', text: 'length' },
        ];
      } else if (patternType === '+') {
        return [
          { value: null, text: 'Operations', disabled: true },
          //  {value: 'typeof', text: 'typeof'},
          { value: 'includes', text: 'includes' },
          { value: 'startswith', text: 'startswith' },
          { value: 'endswith', text: 'endswith' },
          { value: 'equals', text: 'equals' },
          { value: 'length', text: 'length' },
        ];
      }
      return [];
    },

    formatField(field) {
      return field.substring(1, field.length);
    },

    addValidator(validator, index) {
      //  console.log('addValidator:req:', validator, index);
      if (!validator) {
        return new Error('Error : missing argument');
      }
      if (validator.value && validator.value !== null) {
        const formattedField = this.formatField(validator.field);
        this.validators[formattedField][index].registered = true;
        this.validators[formattedField].push({
          field: validator.field,
          value: null,
          operation: null,
          transformation: null,
          registered: false,
        });
      }
      const validators = JSON.parse(JSON.stringify(this.validators));
      this.validators = validators;
      //  console.log('addValidator:res', this.validators[formattedField]);
    },

    removeValidator(validator, index) {
      const formattedField = this.formatField(validator.field);
      this.validators[formattedField].splice(index, 1);
      const validators = JSON.parse(JSON.stringify(this.validators));
      this.validators = validators;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/application-editor.scss';
</style>
