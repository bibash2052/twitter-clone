<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            class="new-tweet"
            bottom-slots
            v-model="newTweet"
            placeholder="What's happening?"
            counter
            autogrow
            maxlength="280"
          >
            <template v-slot:before>
              <q-avatar>
                <img size="xl" src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewTweet"
            unelevated
            rounded
            no-caps
            :disable="!newTweet"
            color="primary"
            label="Tweet"
            class="q-mb-lg"
          />
        </div>
      </div>
      <q-separator size="10px" color="grey-2" class="divider" />

      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            class="q-py-md tweets"
            v-for="tweet in tweets"
            :key="tweet.id"
          >
            <q-item-section avatar top>
              <q-avatar size="xl">
                <img src="https://cdn.quasar.dev/img/avatar5.jpg" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                <strong>Bibash Ghimire</strong>
                <span class="text-grey-7">
                  @bibash_ghimire <br class="lt-md" />&bull;
                  {{ tweet.date | relativeDate }}
                </span>
              </q-item-label>
              <q-item-label class="tweet-content text-body1">
                {{ tweet.content }}
              </q-item-label>
              <div class="row justify-between q-mt-sm tweet-icons">
                <q-btn
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="far fa-comment"
                />
                <q-btn
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="fas fa-retweet"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  :icon="tweet.liked ? 'fas fa-heart' : 'far fa-heart'"
                  :color="tweet.liked ? 'pink' : 'grey'"
                  @click="changeLikedStatus(tweet)"
                />
                <q-btn
                  @click="deleteTweet(tweet)"
                  flat
                  round
                  color="grey"
                  size="sm"
                  icon="fas fa-trash"
                />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import db from "src/boot/firebase";
import { formatDistance } from "date-fns";
export default {
  name: "PageHome",
  data() {
    return {
      newTweet: "",
      tweets: []
    };
  },
  methods: {
    addNewTweet() {
      let newTweet = {
        content: this.newTweet,
        date: Date.now(),
        liked: false
      };
      db.collection("tweets")
        .add(newTweet)
        .then(docRef => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
      this.newTweet = "";
    },
    deleteTweet(tweet) {
      db.collection("tweets")
        .doc(tweet.id)
        .delete()
        .then(() => {
          console.log("Document successfully deleted!");
        })
        .catch(error => {
          console.error("Error removing document: ", error);
        });
    },
    changeLikedStatus(tweet) {
      db.collection("tweets")
        .doc(tweet.id)
        .update({
          liked: !tweet.liked
        })
        .then(() => {
          console.log("document successfully updated");
        })
        .catch(error => {
          console.log("error: ", error);
        });
    }
  },
  filters: {
    relativeDate(value) {
      return formatDistance(parseInt(value), new Date());
    }
  },
  mounted() {
    db.collection("tweets")
      .orderBy("date")
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          let tweetChange = change.doc.data();
          tweetChange.id = change.doc.id;
          if (change.type === "added") {
            this.tweets.unshift(tweetChange);
          }
          if (change.type === "modified") {
            let index = this.tweets.findIndex(
              tweet => tweet.id === tweetChange.id
            );
            Object.assign(this.tweets[index], tweetChange);
          }
          if (change.type === "removed") {
            let index = this.tweets.findIndex(
              tweet => tweet.id === tweetChange.id
            );
            this.tweets.splice(index, 1);
          }
        });
      });
  }
};
</script>

<style lang="sass">
.new-tweet textarea
   font-size: 19px
   line-height: 1.4 !important

.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-4

.tweet-content
  white-space: pre-line

.tweet-icons
  margin-left: -5px

.tweets:not(:first-child)
  border-top: 1px solid rgba(0, 0, 0, 0.12)
</style>
