const { createApp, ref, watch, toRefs, computed } = (typeof Vue === "undefined") ? require("vue") : Vue;

/**
 * <searchable-dropdown
 *     :options="[]" value="_id" label="display_name"
 *     v-model:selected="data" :autoSelectFirstMatch="false"></searchable-dropdown>
 */
const SearchableDropdown = (
{
    props:
    {
        value: {
            type: String,
            default: "value"
        },
        label: {
            type: String,
            default: "label"
        },
        placeholder: {
            type: String,
            default: "Search..."
        },
        options: {
            type: Array,
            required: true
        },
        selected: { // v-model:selected
            default: ""
        },
        autoSelectFirstMatch: {
            type: Boolean,
            default: false
        }
    },

    emits: [ "update:selected", "change", "emptied" ],

    template: `
        <span style="position: relative; display: inline-block">
            <input type="text" v-model="searchQuery" :placeholder="placeholder"
                @focus="isOpen = true" @blur="closeDropdown" style="box-sizing: border-box" />
            <div v-if="isOpen" style="position: absolute; top: 100%; left: 0; width: 100%; max-height: 150px;
                    overflow-y: auto; border: 1px solid #ccc; background: #fff; z-index: 1000">
                <div v-for="option in filteredOptions" :key="option[value]" @click="selectOption(option)"
                        style="padding: 8px; cursor: pointer;">
                    {{ option[label] }}
                </div>
                <div v-if="filteredOptions.length === 0">
                    No options found
                </div>
            </div>
        </span>
    `,

    setup(props, { emit })
    {
        const searchQuery = ref("");
        searchQuery.value = props.selected ?? "";

        const isOpen = ref(false), value = props.value, label = props.label;

        const filteredOptions = computed(_ => {
            return props.options.filter(option => {
                return (option[label] || "").toLowerCase().includes(searchQuery.value.toLowerCase());
            });
        });

        watch(toRefs(props).options, options => // when options change
        {
            for(let option of options)
                if(option[value] == props.selected)
                    searchQuery.value = option[label];
        });

        watch(toRefs(props).selected, selected => // when model changes
        {
            for(let option of props.options)
                if(option[value] == selected)
                    searchQuery.value = option[label];
        });

        const closeDropdown = () => // onblur
        {
            if(searchQuery.value == "")
                emit("emptied");

            else if(props.autoSelectFirstMatch)
                for(let option of props.options)
                    if(option[label].substring(0, searchQuery.value.length) == searchQuery.value)
                    {
                        searchQuery.value = option[label];
                        emit("update:selected", option[value]);
                        emit("change");
                    }

            setTimeout(_ =>
                isOpen.value = false,
            200); // delay to allow click event on options to register
        };

        const selectOption = (option) => // onclick
        {
            emit("update:selected", option[value]);
            emit("change");
            searchQuery.value = option[label];
            isOpen.value = false;
        };

        return { searchQuery, filteredOptions, isOpen, selectOption, closeDropdown };
    }
});

if(typeof module === "object")
    module.exports = { SearchableDropdown };
