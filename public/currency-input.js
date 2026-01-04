/*
    <currency-input locale="de-AT" currency="EUR" v-model="price" />
*/

const parseRepresentationValue = (representationValue, locale = "en-US") =>
{
    // Determine the decimal separator of the used
    const numberFormat = new Intl.NumberFormat(locale);
    const parts = numberFormat.formatToParts(1.1);
    const decimalPart = parts.find(part => part.type === 'decimal');
    const decimalSeparator = decimalPart ? decimalPart.value : '.';

    // Escape the decimal separator for use in regex (in case it's a special char like '.')
    const escapedSeparator = decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex to match everything except digits, minus symbol and the decimal separator
    const regex = new RegExp(`[^0-9${escapedSeparator}\\-]`, 'g');

    // Return parsed float value as string
    return representationValue.replace(regex, '').split(decimalSeparator).join(".");
};

const formatModelValue = (modelValue, locale = "en-US", currency = "USD") =>
{
    // Mongo-style Decimal128 handling
    if(modelValue?.$numberDecimal)
        modelValue = modelValue.$numberDecimal;

    // Format model value in desired currency representation
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(modelValue);
};

const CurrencyInput = (
{
    template: `
        <span>
            <input type="text" v-model="representationValue" @change="onRepresentationUpdated" style="text-align: right" />
        </span>
    `,

    props:
    {
        locale: {
            type: String,
            required: true,
            default: "en-US"
        },
        currency: {
            type: String,
            required: true,
            default: "USD"
        },
        modelValue: {
            //type: Object,
            required: true
        }
    },

    data()
    {
        return {
            representationValue: ""
        };
    },

    mounted()
    {
        this.representationValue = formatModelValue(this.modelValue, this.locale, this.currency);
    },

    methods:
    {
        onRepresentationUpdated()
        {
            const parsed = parseRepresentationValue(this.representationValue, this.locale);
            this.representationValue = formatModelValue(parsed, this.locale, this.currency);

            this.$emit("update:modelValue", parsed);
            this.modelValue = parsed;

            this.$emit("change", parsed);
        }
    }
});

if(typeof module === "object")
    module.exports = { CurrencyInput };
