<template>
  <header>
    <div class="tab" v-for="room,i of rooms" :key="i" @click="current = room" :class="{ active : current == room}">
      {{ room.name }}
    </div>
    <button @click="join()">+</button>
  </header>
  <main>
    <div class="message">
      <div v-for="message of current.messages">
        {{ message.user }} : <span v-html="message.text"></span>
      </div>
    </div>
  </main>

  <footer>
    <textarea rows="4" v-model=input @keydown.enter="send($event)"></textarea>
    <button @click="send($event)">Envoyer</button>
  </footer>
</template>
<script setup>
import {reactive, ref} from 'vue';
import {io} from 'socket.io-client';

const socket = io("http://localhost:4000");
const rooms = reactive([]);
const current = ref({});
const input = ref("");
let user = "";
let error = true;

(function askForUser() {
  user = prompt("Quel est ton pseudo ?");
  if (!user) {
    askForUser();
  }
})()

socket.on("connect", () => {
  socket.on("message", (message) => {
    receive(message);
  });
  socket.on("messages", (messages) => {
    for (const message of messages) {
      receive(message);
    }
  });
  socket.on("alreadyConnected", (message) => {
    error = false;
  });
});

socket.on("disconnect", () => {
  console.log(socket.id);
});

function send(event) {
  if (!event?.shiftKey) {
    event.preventDefault();
    socket.emit("message", { room: current.value.name, user, text: input.value });
    input.value = "";
  }
}

function receive(message) {
  for (const room of rooms) {
    if (room.name === message.room) {
      room.messages.push({ user: message.user, text: message.text });
    }
  }
}

function join() {
  const name = prompt("Indiquez le nom de la salle");
  if (name && error) {
    current.value = { name, messages: [] };
    let roomIdx = rooms.findIndex(room => room.name === name);
    if (roomIdx === -1) {
      rooms.push(current.value);
    }
    socket.emit('join', { name, user });
  }
}
</script>
<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
  padding: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  header {
    flex: 0;
    display: flex;

    .tab {
      padding: 5px;
      border: 1px solid black;
      cursor: pointer;
      user-select: none;

      &.active {
        background: antiquewhite;
      }
    }
  }

  main {
    flex: 1;
  }

  footer {
    flex: 0;
    display: flex;
    width: 100%;

    textarea {
      flex: 1;
      resize: none;
    }
  }
}
</style>
