document.addEventListener('DOMContentLoaded', function () {
    // 모든 이미지 슬라이더 초기화
    const sliders = document.querySelectorAll('.image-slider');

    sliders.forEach(initializeSlider);

    function initializeSlider(slider) {
        const container = slider.querySelector('.slider-container');
        const images = container.querySelectorAll('img');
        const prevBtn = slider.querySelector('.slider-nav.prev');
        const nextBtn = slider.querySelector('.slider-nav.next');
        const dotsContainer = slider.querySelector('.slider-dots');

        // 이미지가 하나뿐이면 화살표와 도트 숨기기
        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        // 도트 생성
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => showImage(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.slider-dot');
        let currentIndex = 0;

        // 이전 버튼 이벤트
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        // 다음 버튼 이벤트
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        // 지정된 인덱스의 이미지 표시
        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            currentIndex = index;
        }

        // 모바일용 터치 스와이프 기능 추가
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50; // 스와이프로 인정할 최소 이동 거리

            if (touchStartX - touchEndX > threshold) {
                // 왼쪽으로 스와이프 - 다음 이미지
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            } else if (touchEndX - touchStartX > threshold) {
                // 오른쪽으로 스와이프 - 이전 이미지
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            }
        }
    }
});
