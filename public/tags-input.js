const TagInput = (
{
    template: `
        <span>
            <span>
                <span v-for="(tag, index) in modelValue" :key="index" style="background: orange; color: white; padding: 5px 10px; border-radius: 15px; align-items: center; margin: 0 5px 0 5px">
                    {{ tag }}
                    <button type="button" @click="removeTag(index)" style="margin-left: 5px; border: none; background: none; color: white; font-weight: bold; cursor: pointer;">&times;</button>
                </span>
            </span>
            <input type="text" v-model="newTag" @keydown.enter.prevent="addTag" placeholder="Add a tag" />
        </span>
    `,

    props:
    {
        modelValue: {
            type: Array,
            required: true
        }
    },

    data()
    {
        return {
            newTag: ""
        };
    },

    methods:
    {
        addTag()
        {
            if(this.newTag.trim() !== "" && (!this.modelValue || !this.modelValue.includes(this.newTag.trim())))
            {
                this.$emit('update:modelValue', [...(this.modelValue || []), this.newTag.trim()]);
                this.newTag = "";
            }
        },

        removeTag(index)
        {
            const newTags = [...this.modelValue];
            newTags.splice(index, 1);
            this.$emit('update:modelValue', newTags);
        }
    }
});

if(typeof module === "object")
    module.exports = { TagInput };
