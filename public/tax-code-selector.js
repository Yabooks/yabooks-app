if(typeof module === "object")
    SearchableDropdown = require("./searchable-dropdown").SearchableDropdown;

const TaxCodeSelector = (
{
    template: `
        <span>
            <input type="checkbox" v-model="isTaxBase" @change="visualTaxCodeSelected" title="is tax base" />
            <select v-model="selectedVisualTaxCode" @change="visualTaxCodeSelected" style="max-width: 200px">
                <option :value="null">
                    no tax
                </option>
                <template v-for="visualTaxCode in visualTaxCodes" :key="visualTaxCode.displayName">
                    <option :value="visualTaxCode">
                        {{ visualTaxCode.displayName }}
                    </option>
                </template>
            </select>
        </span>
    `,

    components: { SearchableDropdown },

    props:
    {
        tax_code: {
            type: String,
            required: true
        },
        tax_code_base: {
            type: String,
            required: true
        },
        tax_sub_code: {
            type: String,
            required: true
        },
        tax_sub_code_base: {
            type: String,
            required: true
        },
        tax_percent: {
            type: Number,
            required: true
        },
        tax_codes: {
            type: Array,
            required: true
        }
    },

    data()
    {
        return {
            isTaxBase: false,
            visualTaxCodes: [],
            selectedVisualTaxCode: null,
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
                            percent: rate,
                            code: taxCode.code,
                            sub_code: subCode.code,
                            displayName: `${filters.formatTaxCode(taxCode.code)} ${taxCode.description ?? ""} ${subCode.description ?? ""} ${rate ? `${rate}%` : ""}`.trim()
                        });

                        if(this.tax_code == taxCode.code && this.tax_sub_code == subCode.code && this.tax_percent == rate)
                        {
                            this.isTaxBase = false;
                            this.selectedVisualTaxCode = this.visualTaxCodes[this.visualTaxCodes.length - 1];
                        }
                        else if(this.tax_code_base == taxCode.code && this.tax_sub_code_base == subCode.code && this.tax_percent == rate)
                        {
                            this.isTaxBase = true;
                            this.selectedVisualTaxCode = this.visualTaxCodes[this.visualTaxCodes.length - 1];
                        }
                    }
            this.$forceUpdate();
        },

        visualTaxCodeSelected()
        {
            this.$emit("update:tax_code", this.isTaxBase ? null : this.selectedVisualTaxCode.code);
            this.$emit("update:tax_code_base", this.isTaxBase ? null : this.selectedVisualTaxCode.sub_code);
            this.$emit("update:tax_sub_code", this.isTaxBase ? this.selectedVisualTaxCode.code : null);
            this.$emit("update:tax_sub_code_base", this.isTaxBase ? this.selectedVisualTaxCode.sub_code : null);
            this.$emit("update:tax_percent", this.selectedVisualTaxCode.rate);
        }
    }
});

if(typeof module === "object")
    module.exports = { TaxCodeSelector };
