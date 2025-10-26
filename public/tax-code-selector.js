if(typeof module === "object")
    SearchableDropdown = require("./searchable-dropdown").SearchableDropdown;

/**
 * <tax-code-selector :tax_codes="tax_codes"
 *     v-model:tax_code="tx.tax_code" v-model:tax_code_base="tx.tax_code_base"
 *     v-model:tax_sub_code="tx.tax_sub_code" v-model:tax_sub_code_base="tx.tax_sub_code_base"
 *     v-model:tax_percent="tx.tax_percent" />
 */
const TaxCodeSelector = (
{
    template: `
        <span>
            <input type="checkbox" v-model="isTaxBase" @change="visualTaxCodeSelected" title="is tax base" />
            <searchable-dropdown
                :options="visualTaxCodes" label="displayName" value="value"
                v-model:selected="selectedTaxCode" @change="visualTaxCodeSelected">
        </span>
    `,

    components: { SearchableDropdown },

    props:
    {
        tax_code: { // LedgerTransaction.tax_code
            type: String,
            required: true
        },
        tax_codes: { // list of available tax codes as of GET /api/v1/tax-codes
            type: Array,
            required: true
        },
        tax_code_base: { // v-model:tax_code_base for LedgerTransaction.tax_code_base
            type: String,
            required: true
        },
        tax_sub_code: { // v-model:tax_sub_code for LedgerTransaction.tax_sub_code
            type: String,
            required: true
        },
        tax_sub_code_base: { // v-model:tax_sub_code_base for LedgerTransaction.tax_sub_code_base
            type: String,
            required: true
        },
        tax_percent: { // v-model:tax_percent for LedgerTransaction.tax_percent
            type: Number,
            required: true
        }
    },

    data()
    {
        return {
            isTaxBase: false,
            visualTaxCodes: [ { displayName: "no tax", value: null } ],
            selectedTaxCode: null,
        };
    },

    mounted()
    {
        this.onTaxCodeListUpdated();
    },

    watch:
    {
        tax_codes: "onTaxCodeListUpdated"
    },

    methods:
    {
        onTaxCodeListUpdated()
        {
            for(let taxCode of this.tax_codes)
                for(let subCode of (taxCode.subCodes ?? [ {} ]))
                    for(let rate of (taxCode.rates ?? [ null ]))
                    {
                        this.visualTaxCodes.push(
                        {
                            value: {
                                percent: rate,
                                code: taxCode.code,
                                sub_code: subCode.code,
                            },
                            displayName: `${filters.formatTaxCode(taxCode.code)} ${taxCode.description ?? ""} ${subCode.description ?? ""} ${rate ? `${rate}%` : ""}`.trim()
                        });

                        // mark currently set value as selected
                        if(this.tax_code == taxCode.code && this.tax_sub_code == subCode.code && this.tax_percent == rate)
                        {
                            this.isTaxBase = false;
                            this.selectedTaxCode = this.visualTaxCodes[this.visualTaxCodes.length - 1].value;
                        }
                        else if(this.tax_code_base == taxCode.code && this.tax_sub_code_base == subCode.code && this.tax_percent == rate)
                        {
                            this.isTaxBase = true;
                            this.selectedTaxCode = this.visualTaxCodes[this.visualTaxCodes.length - 1].value;
                        }
                    }
            this.$forceUpdate();
        },

        visualTaxCodeSelected()
        {
            this.$emit("update:tax_code", this.isTaxBase ? null : this.selectedTaxCode.code);
            this.$emit("update:tax_code_base", this.isTaxBase ? this.selectedTaxCode.code : null);
            this.$emit("update:tax_sub_code", this.isTaxBase ? null : this.selectedTaxCode.sub_code);
            this.$emit("update:tax_sub_code_base", this.isTaxBase ? this.selectedTaxCode.sub_code : null);
            this.$emit("update:tax_percent",this.selectedTaxCode.percent);
            this.$emit("change"); // fire @change
        }
    }
});

if(typeof module === "object")
    module.exports = { TaxCodeSelector };
