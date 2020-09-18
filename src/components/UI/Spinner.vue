<template>
	<div class="sk-fading-circle">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>
</template>

<style>
.sk-fading-circle {
	width: 40px;
	height: 40px;
	position: relative;
}

.sk-fading-circle > div {
	background-color: initial;
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
}

.sk-fading-circle > div::before {
	content: '';
	display: block;
	margin: 0 auto;
	width: 15%;
	height: 15%;
	background-color: currentColor;
	border-radius: 100%;
	animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
}

.sk-fading-circle > div:nth-child(2) { transform: rotate(30deg); }
.sk-fading-circle > div:nth-child(3) { transform: rotate(60deg); }
.sk-fading-circle > div:nth-child(4) { transform: rotate(90deg); }
.sk-fading-circle > div:nth-child(5) { transform: rotate(120deg); }
.sk-fading-circle > div:nth-child(6) { transform: rotate(150deg); }
.sk-fading-circle > div:nth-child(7) { transform: rotate(180deg); }
.sk-fading-circle > div:nth-child(8) { transform: rotate(210deg); }
.sk-fading-circle > div:nth-child(9) { transform: rotate(240deg); }
.sk-fading-circle > div:nth-child(10) { transform: rotate(270deg); }
.sk-fading-circle > div:nth-child(11) { transform: rotate(300deg); }
.sk-fading-circle > div:nth-child(12) { transform: rotate(330deg); }
.sk-fading-circle > div:nth-child(2)::before { animation-delay: -1.1s; }
.sk-fading-circle > div:nth-child(3)::before { animation-delay: -1s; }
.sk-fading-circle > div:nth-child(4)::before { animation-delay: -0.9s; }
.sk-fading-circle > div:nth-child(5)::before { animation-delay: -0.8s; }
.sk-fading-circle > div:nth-child(6)::before { animation-delay: -0.7s; }
.sk-fading-circle > div:nth-child(7)::before { animation-delay: -0.6s; }
.sk-fading-circle > div:nth-child(8)::before { animation-delay: -0.5s; }
.sk-fading-circle > div:nth-child(9)::before { animation-delay: -0.4s; }
.sk-fading-circle > div:nth-child(10)::before { animation-delay: -0.3s; }
.sk-fading-circle > div:nth-child(11)::before { animation-delay: -0.2s; }
.sk-fading-circle > div:nth-child(12)::before { animation-delay: -0.1s; }

@keyframes sk-circleFadeDelay {
	0%, 39%, 100% { opacity: 0; }
	40% { opacity: 1; }
}
</style>