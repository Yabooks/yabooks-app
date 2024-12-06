const { createApp, ref, computed } = (typeof Vue === "undefined") ? require("vue").Vue : Vue;

const css = `
    :scope {
        position: relative;
        display: inline-block;
        width: 300px;
    }

    .dropdown input {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
    }

    .dropdown-options {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid #ccc;
        background: #fff;
        z-index: 1000;
    }

    .dropdown-options div {
        padding: 8px;
        cursor: pointer;
    }

    .dropdown-options div:hover {
        background-color: #f0f0f0;
    }
`;

const SearchableDropdown = (
{
    props:
    {
        options: {
            type: Array,
            required: true
        }
    },

    template: `
        <div class="dropdown">
            <style type="text/css"> @scope { ${css} }</style>
            <input type="text" v-model="searchQuery" placeholder="Search..." @focus="isOpen = true" @blur="closeDropdown" />
            <div v-if="isOpen" class="dropdown-options">
                <div v-for="option in filteredOptions" :key="option.value" @click="selectOption(option)">
                    {{ option.label }}
                </div>
                <div v-if="filteredOptions.length === 0">
                    No options found
                </div>
            </div>
        </div>
    `,

    setup(props, { emit })
    {
        const searchQuery = ref("");
        const isOpen = ref(false);

        const filteredOptions = computed(_ => {
            return props.options.filter(option =>
                option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        const selectOption = (option) =>
        {
            emit("update:selected", option.value);
            searchQuery.value = option.label;
            isOpen.value = false;
        };

        const closeDropdown = () =>
        {
            setTimeout(_ => isOpen.value = false, 200); // Delay to allow click event on options to register
        };

        return { searchQuery, filteredOptions, isOpen, selectOption, closeDropdown };
    }
});

if(typeof module === "object")
    module.exports = { SearchableDropdown };
