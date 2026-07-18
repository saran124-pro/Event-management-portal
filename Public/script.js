const form = document.getElementById('event-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const locationInput = document.getElementById('location');
const capacityInput = document.getElementById('capacity');
const idInput = document.getElementById('event-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const eventsList = document.getElementById('events-list');

document.addEventListener('DOMContentLoaded', loadEvents);

async function loadEvents() {
  const res = await fetch('/api/events');
  const events = await res.json();

  eventsList.innerHTML = '';

  // Soonest events first
  events
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(event => {
      const spotsLeft = event.capacity !== null
        ?  `${Math.max(event.capacity - event.attendees.length, 0)} spot(s) left of ${event.capacity}`
        : 'Open capacity';

      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `
        <h3>${escapeHtml(event.title)}</h3>
        <div class="meta">${formatDate(event.date)} · ${escapeHtml(event.location)} · ${spotsLeft}</div>
        ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ''}
        <div class="attendees">${event.attendees.length} attending${event.attendees.length ? ': ' + event.attendees.map(a => escapeHtml(a.name)).join(', ') : ''}</div>
        <div class="rsvp-row">
          <input type="text" placeholder="Your name" class="rsvp-name" data-id="${event.id}">
          <button class="rsvp-btn" data-id="${event.id}">RSVP</button>
        </div>
        <div class="event-actions">
          <button class="edit-btn" data-id="${event.id}">Edit</button>
          <button class="delete-btn" data-id="${event.id}">Delete</button>
        </div>
      `;
      eventsList.appendChild(div);
    });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id, events));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
  });

  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', () => rsvpToEvent(btn.dataset.id));
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function startEdit(id, events) {
  const event = events.find(e => String(e.id) === id);
  if (!event) return;

  idInput.value = event.id;
  titleInput.value = event.title;
  descriptionInput.value = event.description;
  dateInput.value = event.date;
  locationInput.value = event.location;
  capacityInput.value = event.capacity ?? '';
  submitBtn.textContent = 'Save Changes';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  idInput.value = '';
  form.reset();
  submitBtn.textContent = 'Add Event';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const date = dateInput.value;
  const location = locationInput.value.trim();
  const capacity = capacityInput.value;
  const id = idInput.value;

  if (!title || !date || !location) return;

  const payload = { title, description, date, location, capacity };

  if (id) {
    await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  resetForm();
  loadEvents();
});
async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;

  await fetch(`/api/events/${id}`, { method: 'DELETE' });
  loadEvents();
}

async function rsvpToEvent(id) {
  const input = document.querySelector(`.rsvp-name[data-id="${id}"]`);
  const name = input.value.trim();

  if (!name) {
    alert('Enter your name to RSVP');
    return;
  }

  const res = await fetch(`/api/events/${id}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Could not RSVP');
    return;
  }

  loadEvents();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}