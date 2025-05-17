// js/browser-check.js

// DOM(Document Object Model) 컨텐츠가 완전히 로드되고 파싱되었을 때 스크립트 실행
document.addEventListener('DOMContentLoaded', function () {
    // HTML에서 id가 "game-play-link"인 요소를 찾습니다.
    const gamePlayLink = document.getElementById('game-play-link');

    // 해당 링크 요소가 존재하는지 확인합니다.
    if (gamePlayLink) {
        // 링크에 'click' 이벤트 리스너를 추가합니다.
        // 이벤트 핸들러를 async 함수로 선언하여 내부에서 await를 사용할 수 있도록 합니다.
        gamePlayLink.addEventListener('click', async function (event) {
            let webGPUSupportedByAPI = false;
            let adapterAvailable = false;
            let specificErrorMessage = ""; // 상황에 따른 구체적인 에러 메시지

            // 1. navigator.gpu 객체 존재 여부 확인 (WebGPU API 기본 지원 확인)
            if (!navigator.gpu) {
                specificErrorMessage = "현재 사용 중인 브라우저에서는 WebGPU API를 찾을 수 없습니다.\n";
                webGPUSupportedByAPI = false;
            } else {
                webGPUSupportedByAPI = true; // API 자체는 존재함
                // 2. GPUAdapter 요청 시도 (실제 사용 가능한 GPU 하드웨어 확인)
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) {
                        adapterAvailable = true;
                        // 어댑터가 성공적으로 반환되면 WebGPU를 사용할 수 있는 환경으로 간주합니다.
                        // console.log("WebGPU 어댑터 정보:", adapter); // 필요시 어댑터 정보 로깅
                    } else {
                        // requestAdapter()가 null을 반환하면 적절한 어댑터가 없는 것입니다.
                        specificErrorMessage = "WebGPU API는 브라우저에서 인식되지만, 현재 시스템에서 사용 가능한 WebGPU 호환 그래픽 어댑터(GPU)를 찾을 수 없습니다. 그래픽 드라이버를 최신 버전으로 업데이트하거나, 시스템 설정을 확인해 주십시오.\n";
                        adapterAvailable = false;
                    }
                } catch (error) {
                    // requestAdapter() 호출 중 에러 발생 시
                    console.error("WebGPU 어댑터 요청 중 오류 발생:", error);
                    specificErrorMessage = "WebGPU 어댑터를 요청하는 중 오류가 발생했습니다. 이는 안전하지 않은 오리진(HTTP 환경)에서 실행 중이거나, 브라우저 또는 시스템 설정 문제일 수 있습니다. 브라우저 콘솔에서 자세한 오류 내용을 확인해주세요.\n";
                    adapterAvailable = false;
                }
            }

            // WebGPU가 완전히 지원되지 않는 경우 (API 자체가 없거나, 어댑터를 가져올 수 없는 경우)
            if (!webGPUSupportedByAPI || !adapterAvailable) {
                event.preventDefault();
                showWebGPUModal(specificErrorMessage, gamePlayLink.href);
            }
            // WebGPU가 지원되는 것으로 판단되면 (API 존재 및 어댑터 사용 가능), 아무런 추가 동작 없이 기본 링크 이동을 수행합니다.
        });
    }

    // ===== WebGPU 모달 관련 함수 및 이벤트 =====
    function showWebGPUModal(specificErrorMessage, continueUrl) {
        const modal = document.getElementById('webgpu-modal');
        const modalMsg = document.getElementById('webgpu-modal-message');
        const closeBtn = document.getElementById('webgpu-modal-close');
        const cancelBtn = document.getElementById('webgpu-modal-cancel');
        const continueBtn = document.getElementById('webgpu-modal-continue');
        const template = document.getElementById('webgpu-warning-template');

        // 템플릿에서 안내문 복사 (별도 처리 없이 그대로 보여줌)
        modalMsg.innerHTML = '';
        if (template && template.content) {
            modalMsg.appendChild(template.content.cloneNode(true));
        } else {
            modalMsg.textContent = 'WebGPU 안내';
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // 닫기 함수
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
        continueBtn.onclick = function () {
            closeModal();
            window.location.href = continueUrl;
        };
        window.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', escListener);
            }
        });
        modal.onclick = function (e) {
            if (e.target === modal) closeModal();
        };
    }
});
