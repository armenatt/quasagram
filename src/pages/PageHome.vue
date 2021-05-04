<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
          <q-card
            class="card-post q-mb-md"
            flat
            bordered
            v-for="post in posts"
            :key="post.id"
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    src="https://ccdi-unisg.ch/wp-content/uploads/2019/03/blank-profile-picture-973460_1280-1024x1024.png"
                    alt=""
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">comestab1e</q-item-label>
                <q-item-label caption>{{ post.location }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-img :src="post.imageUrl"></q-img>
            <q-card-section>
              <div>{{ post.caption }}</div>
              <div class="text-caption text-grey">
                {{ filters.niceDate(post.date) }}
              </div>
            </q-card-section>
          </q-card>
        </template>
        <template v-else-if="!loadingPosts && !posts.length">
          <h5 class="text-center text-grey">No posts yet</h5>
        </template>
        <template v-else>
          <div class="q-pa-md">
            <q-card flat bordered>
              <q-item>
                <q-item-section avatar>
                  <q-skeleton type="QAvatar" animation="fade" size="40px" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                  <q-item-label caption>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-skeleton height="200px" square animation="fade" />

              <q-card-section>
                <q-skeleton
                  type="text"
                  class="text-subtitle2"
                  animation="fade"
                />
                <q-skeleton
                  type="text"
                  width="50%"
                  class="text-subtitle2"
                  animation="fade"
                />
              </q-card-section>
            </q-card>
          </div>
        </template>
      </div>
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img
                src="https://ccdi-unisg.ch/wp-content/uploads/2019/03/blank-profile-picture-973460_1280-1024x1024.png"
                alt=""
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">comestab1e</q-item-label>
            <q-item-label caption>Armen Torosian</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar";

export default {
  name: "PageCamera",

  data() {
    return {
      posts: [],
      loadingPosts: false,
      filters: {
        niceDate(timeStamp) {
          return date.formatDate(timeStamp, "MMMM D h:mmA");
        }
      }
    };
  },
  methods: {
    getPosts() {
      this.loadingPosts = true;
      this.$axios
        .get(`${process.env.API}/posts`)
        .then(response => {
          this.posts = response.data;

          this.loadingPosts = false;
        })
        .catch(err => {
          this.$q.dialog({
            title: "Error",
            message: "Could not find any posts"
          });
          this.loadingPosts = false;
        });
    }
  },
  created() {
    this.getPosts();
  }
};
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
