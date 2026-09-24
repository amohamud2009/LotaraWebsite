(() => {
  const examples = {
    scrolling: {
      label: 'A quieter evening', title: 'The feed can wait.', subtitle: 'This moment is yours.',
      description: 'Put a little space between the urge and the next scroll.',
      reason: 'To be here for my life, not just watch everyone else’s.',
      quote: '“I opened my phone for a minute. Now I can’t put it down.”'
    },
    vaping: {
      label: 'A moment without it', title: 'The craving is here.', subtitle: 'So is support.',
      description: 'Pause with your breath and come back to your reason for quitting.',
      reason: 'To stop planning my day around the next time I reach for it.',
      quote: '“I told myself I was done. Then the familiar feeling showed up.”'
    },
    drinking: {
      label: 'Your evening, your choice', title: 'A hard evening.', subtitle: 'A different next step.',
      description: 'Make room for a pause and an alternative you chose for yourself.',
      reason: 'To wake up clear and be fully present for the people I love.',
      quote: '“It’s the end of a long day. This is usually when I reach for a drink.”'
    }
  };
  const buttons = [...document.querySelectorAll('[data-habit]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const example = examples[button.dataset.habit];
    if (!example) return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('habit-label').textContent = example.label;
    const title = document.getElementById('habit-title');
    title.replaceChildren(document.createTextNode(example.title), document.createElement('br'));
    const emphasis = document.createElement('em');
    emphasis.textContent = example.subtitle;
    title.append(emphasis);
    document.getElementById('habit-description').textContent = example.description;
    document.getElementById('habit-reason').textContent = example.reason;
    document.getElementById('recognition-quote').textContent = example.quote;
  }));
})();

// A small, local reflection preview. No answers are collected or saved.
(() => {
  const prompts = [
    ['What did you need', 'in that moment?'],
    ['What made today', 'a little easier?'],
    ['What would you like', 'to try tomorrow?']
  ];
  let current = 0;
  const button = document.getElementById('next-prompt');
  const output = document.getElementById('reflection-prompt');
  if (!button || !output) return;
  button.addEventListener('click', () => {
    current = (current + 1) % prompts.length;
    output.replaceChildren(document.createTextNode(prompts[current][0]), document.createElement('br'), document.createTextNode(prompts[current][1]));
  });
})();
