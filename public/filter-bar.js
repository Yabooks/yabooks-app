const { ref, computed } = (typeof Vue === "undefined") ? require("vue") : Vue;

class Rule
{
    constructor(key, operator, value)
    {
        this.type = "rule";
        this.key = key;
        this.operator = operator;
        this.value = value;
    }

    toMongoQuery()
    {
        let query = {};
        query[this.key] = {};
        query[this.key][this.operator.mongo] = this.value;
        return query;
    }
};

class Group
{
    constructor(operator, rules)
    {
        this.type = "group";
        this.operator = operator || "$and";
        this.rules = rules || [ new Rule() ];
    }

    toMongoQuery()
    {
        let query = {};
        query[this.operator] = this.rules.map(rule => rule.toMongoQuery());
        return query;
    }
};

const FilterBarGroup = (
{
    props:
    {
        keys: {
            type: Array,
            required: true
        },
        operators: {
            type: Array,
            required: true
        },
        types: {
            type: Array,
            required: true
        },
        self: {
            type: Group,
            required: true
        }
    },

    setup(props, { emit })
    {
        const translate = (key) =>
        {
            if(key == "$and")
                return "AND";

            if(key == "$or")
                return "OR";

            return key;
        };

        const getType = (key) =>
        {
            for(let i in props.keys)
                if(key === props.keys[i] && props.types?.[i])
                    return props.types[i];
            return "text";
        };

        const addGroup = () =>
        {
            props.self.rules.push(new Group());
        };

        const addRule = () =>
        {
            props.self.rules.push(new Rule(props?.keys?.[0], props?.operators?.[0], ''));
        };

        const removeRule = (index) =>
        {
            props.self.rules.splice(index, 1);
        };

        return { translate, getType, addGroup, addRule, removeRule };
    },

    template: `
        <div style="margin: 10px; display: inline-block; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff">
            <div v-for="(rule, index) in self.rules" :key="index" style="display: inline-block">
                <span v-if="rule.type == 'rule'">
                    <span>
                        <select v-model="rule.key" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; margin: 0 5px 0 5px">
                            <option v-for="key in keys" :key="key" :value="key">
                                {{ key }}
                            </option>
                        </select>
                        <select v-model="rule.operator" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; margin: 0 5px 0 5px">
                            <option v-for="operator in operators" :key="operator" :value="operator">
                                {{ operator.display }}
                            </option>
                        </select>
                        <input v-model="rule.value" :type="getType(rule.key)" placeholder="Enter value"
                            style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; margin: 0 5px 0 5px" />
                    </span>
                    <button @click="removeRule(index)" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #F98F5E; color: white; cursor: pointer; font-size: 14px; margin: 0 5px 0 5px">
                        &#x1F5D1;&#xFE0F;
                    </button>
                    <div v-if="index == 0 && self.rules?.length > 1" style="display: inline-block">
                        <select v-model="self.operator" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; margin: 0 5px 0 5px">
                            <option v-for="operator in [ '$and', '$or' ]" :value="operator">
                                {{ translate(operator) }}
                            </option>
                        </select>
                    </div>
                    <span v-if="index > 0 && index < self.rules?.length - 1" style="margin: 0 5px 0 5px">
                        {{ translate(self.operator) }}
                    </span>
                </span>
                <span v-if="rule.type == 'group'">
                    <filter-bar-group :keys="keys" :operators="operators" :types="types" :self="rule"></filter-bar-group>
                    <button @click="removeRule(index)" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #F98F5E; color: white; cursor: pointer; font-size: 14px; margin: 0 5px 0 5px">
                        &#x1F5D1;&#xFE0F;
                    </button>
                </span>
            </div>
            <button @click="addRule" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #F98F5E; color: white; cursor: pointer; font-size: 14px; margin: 0 5px 0 5px">
                +
            </button>
            <button @click="addGroup" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #F98F5E; color: white; cursor: pointer; font-size: 14px; margin: 0 5px 0 5px">
                +(...)
            </button>
        </div>
    `
});

FilterBarGroup.components = {
    FilterBarGroup
};

const FilterBar = (
{
    props:
    {
        keys: {
            type: Array,
            required: true
        },
        operators: {
            type: Array,
            default: [
                { display: '\u003d', mongo: "$eq" },
                { display: '\u2260', mongo: "$neq" },
                { display: '\u003c', mongo: "$lt" },
                { display: '\u2264', mongo: "$lte" },
                { display: '\u003e', mongo: "$gt" },
                { display: '\u2265', mongo: "$gte" },
                { display: '\u2283', mongo: "$search" }
            ]
        },
        types: {
            type: Array,
            default: []
        }
    },

    components: { FilterBarGroup },

    setup(props, { emit })
    {
        let root = new Group();

        return (
        {
            self: ref(root),

            applyFilters: () =>
            {
                let query = root.toMongoQuery();
                emit("update", query);
            }
        });
    },

    template: `
        <div style="gap: 10px; background: #f7f9fc; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)">
            <filter-bar-group :keys="keys" :operators="operators" :types="types" :self="self"></filter-bar-group>
            <button @click="applyFilters" style="padding: 8px 12px; border: none; border-radius: 5px; background-color: #F98F5E; color: white; cursor: pointer; font-size: 14px">
                &#x2714;&#xFE0F;
            </button>
        </div>
  `
});

if(typeof module === "object")
    module.exports = { FilterBar };
