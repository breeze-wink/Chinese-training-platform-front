<template>
    <div class="page-container">
        <div class="main-container">
            <div class="poem-detail">
                <button class="back-button" @click="goBack">返回</button>
                <div v-if="poem.title" class="poem-content">
                    <h1 class="poem-title">{{ poem.title }}</h1>
                    <p class="poem-author">{{ poem.author }} | {{ poem.dynasty }}</p>
                    <p class="poem-annotation">{{ poem.annotation }}</p>
                    <div class="poem-text-container">
                        <pre class="poem-text">{{ poem.content }}</pre>
                    </div>
                    <div class="navigation-buttons">
                        <button class="nav-button" v-if="hasPrev" @click="goToPrev">上一篇</button>
                        <button class="nav-button" v-if="hasNext" @click="goToNext">下一篇</button>
                    </div>
                </div>
                <div v-else class="loading">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    poems_seven_upper,
    poems_seven_lower,
    poems_eight_upper,
    poems_eight_lower,
    poems_nine_upper,
    poems_nine_lower
} from '@/store/poems';

export default {
    name: 'TouristPoem',
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            poem: {},
            allPoems: []
        };
    },
    computed: {
        hasPrev() {
            return this.allPoems.findIndex(p => p.title === this.id) > 0;
        },
        hasNext() {
            return this.allPoems.findIndex(p => p.title === this.id) < this.allPoems.length - 1;
        }
    },
    mounted() {
        if (this.id) {
            this.fetchPoemDetails(this.id);
        } else {
            console.error('ID is undefined or missing');
        }
    },
    watch: {
        id: {
            immediate: true,
            handler(newId) {
                if (newId) {
                    this.fetchPoemDetails(newId);
                } else {
                    console.error('ID is undefined or missing');
                }
            }
        }
    },
    methods: {
        fetchPoemDetails(id) {
            this.allPoems = [
                ...poems_seven_upper,
                ...poems_seven_lower,
                ...poems_eight_upper,
                ...poems_eight_lower,
                ...poems_nine_upper,
                ...poems_nine_lower
            ];

            // 查找与 id 匹配的诗词
            this.poem = this.allPoems.find(poem => poem.title === id) || {};
        },
        goBack() {
            this.$router.push({ path: '/' });
        },
        goToPrev() {
            const currentIndex = this.allPoems.findIndex(p => p.title === this.id);
            if (currentIndex > 0) {
                this.$router.push({ name: 'TouristPoem', params: { id: this.allPoems[currentIndex - 1].title } });
            }
        },
        goToNext() {
            const currentIndex = this.allPoems.findIndex(p => p.title === this.id);
            if (currentIndex < this.allPoems.length - 1) {
                this.$router.push({ name: 'TouristPoem', params: { id: this.allPoems[currentIndex + 1].title } });
            }
        }
    }
};
</script>

<style scoped>
.page-container {
    background-color: #f9f9f9;
    background-image: url('../static/mountains.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-container {
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex: 1;
}

.poem-detail {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    flex: 1;
    padding-left: 20px;
}

.back-button {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #626aef;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
}

.back-button:hover {
    background-color: #4a50e2;
}

.poem-content {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    max-width: 800px;
    width: 75%;
    background-color: #fff;
    margin: 0 auto;
}

.poem-title {
    font-family: 'Noto Serif SC', serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.poem-author {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 1rem;
}

.poem-annotation {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    color: #888;
    margin-bottom: 2rem;
}

.poem-text-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.poem-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.2rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0 auto;
    max-width: 80ch;
    color: #333;
    text-align: center;
}

.navigation-buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.nav-button {
    padding: 10px 20px;
    background-color: #626aef;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    margin: 0 10px;
}

.nav-button:hover {
    background-color: #4a50e2;
}

.loading {
    font-size: 1.5rem;
    color: #aaa;
}
</style>