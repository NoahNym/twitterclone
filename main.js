import './style.css'
import { supabase } from './supabase.js'

// Auth

// Listen to auth events
supabase.auth.onAuthStateChange((event, session) => {
  const LoginEl = document.querySelector("#login")
  const LogoutEl = document.querySelector("#logout")
  const NewTweetEl = document.querySelector("main > div")

  if (event == 'SIGNED_IN') {
    console.log('SIGNED_IN', session)

    // Hide login
    LoginEl.classList.add("hidden")

    // Show logout
    document.querySelector("#logout > h2").innerText = session.user.email
    LogoutEl.classList.remove("hidden")

    // Show new tweet
    NewTweetEl.classList.remove("hidden")
  }

  if (event == 'SIGNED_OUT') {
    // Show login
    LoginEl.classList.remove("hidden")

    // Hide logout
    LogoutEl.classList.add("hidden")

    // Hide New Tweet
    NewTweetEl.classList.add("hidden")

  }
})


// Sign in/up
const form = document.querySelector("form")

form.addEventListener("submit", async function (event) {
  const email = form[0].value
  const password = form[1].value

  // Prevenst page refresh
  event.preventDefault()

  // Login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If login error
  if (signInError) {
    // If no account, sign up  
    if (signInError.message === "Invalid login credentials") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      // Create user in database
      if (signUpData.user) {
        const { error } = await supabase
          .from('users')
          .insert({ username: signUpData.user.email })

          if (error) console.log(error)
      }
      // If user already registered
      if (signUpError.message === "User already registered") {
        alert(signInError.message)
      } else {
        alert(signUpError.message)
      }
    }
  }
})

// Sign out
const signOutButton = document.querySelector("#logout > button")

signOutButton.addEventListener("click", async function () {
  const { error } = await supabase.auth.signOut()

  if (error) console.log(error)
})

// Tweets

// Listen for changes in the database table
supabase
  .channel('public:tweets')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Tweets' }, newTweet)
  .subscribe()

let newTweetCount = 0

function newTweet(e) {
  newTweetCount++

  const newTweetsEl = document.querySelector("#new-tweets")

  newTweetsEl.innerText = `Show ${newTweetCount} new Tweets`
  newTweetsEl.classList.remove("hidden")
}

// Refresh feed
document.querySelector("#new-tweets").addEventListener("click", function () {
  const newTweetsEl = document.querySelector("#new-tweets").classList.add("hidden")
  const listEl = document.querySelector('ul')
  listEl.replaceChildren()
  getTweets()
  newTweetCount = 0


})

async function getTweets() {
  // Get data from database
  const { data, error } = await supabase
    .from('Tweets')
    .select(`
    id,
    message,
    created_at,
    users (
      username
    )
    `).order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  const listEl = document.querySelector('ul')

  const { data: user } = await supabase.auth.getSession()



  // Loop over tweets
  for (const i of data) {
    const itemEl = document.createElement('li')
    itemEl.classList.add('flex', 'gap-4', 'border-b', 'pb-6')

    itemEl.innerHTML = `
      <div class="w-14 h-14 rounded-full">
        <img
          src="logo.png"
          alt=""
        >
      </div>
      <div class="w-full">
        <div class="flex gap-2 text-gray-500">
          <span class="font-semibold text-black">${i.users.username}</span>
          <span>${new Date(i.created_at).toLocaleString()}</span>
          <i class="ph-trash text-xl cursor-pointer text-blue-500" ${i.users.username == user.session?.user.email ? "" : "hidden"}></i>
        </div>
        <p>${i.message}</p>
      </div>
    `

    itemEl.addEventListener("click", async function (event) {
      console.log(i.id)

      // Delete tweet
      const { error } = await supabase
        .from('Tweets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ')
        .delete()
        .eq('id', i.id)

      // Delete element
      itemEl.remove()

      if (error) console.log(error)
    })

    listEl.appendChild(itemEl)
  }
}

getTweets()

// New tweet
document.querySelector("#tweet").addEventListener("click", async function () {
  const text = document.querySelector("textarea")
  if (text.value != "") {



    const { data, error } = await supabase.auth.getSession()


    if (data.session.user.id) {
      const { error } = await supabase
        .from('Tweets')
        .insert({ message: text.value })


      if (error) console.log(error)

      // Clear input
      text.value = ""
    }
  }
})