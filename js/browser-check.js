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

        let fullWarningMessage = "<strong>WebGPU 지원 안내</strong><br><br>";
        if (specificErrorMessage) {
            fullWarningMessage += specificErrorMessage.replace(/\n/g, '<br>');
        }
        fullWarningMessage += "<br>이 게임은 최신 그래픽 기술인 <b>WebGPU</b>를 사용하여 제작되었습니다. 원활한 게임 플레이를 위해 WebGPU를 지원하는 환경이 필요합니다.<br><br>";
        fullWarningMessage += "<b>권장 브라우저 및 환경 (2025년 초 기준):</b><br>";
        fullWarningMessage += "항상 최신 버전의 브라우저를 사용해주세요.<br><br>";
        fullWarningMessage += "<b>데스크톱:</b><br>";
        fullWarningMessage += "- Chrome (버전 113 이상): Windows, macOS, ChromeOS, Linux<br>";
        fullWarningMessage += "- Edge (버전 113 이상): Windows, macOS, Linux<br>";
        fullWarningMessage += "- Firefox (Nightly 빌드 또는 버전 141 이상 예정, 현재는 플래그 활성화 필요)<br>";
        fullWarningMessage += "- Safari (macOS 최신 버전의 Technology Preview 또는 Safari 정식 버전에서 개발자 메뉴/기능 플래그로 활성화)<br>";
        fullWarningMessage += "- Opera (버전 100 이상)<br><br>";
        fullWarningMessage += "<b>모바일:</b><br>";
        fullWarningMessage += "- Chrome for Android (버전 121/123 이상)<br>";
        fullWarningMessage += "- Safari on iOS (iOS 18 베타 이상, 설정에서 기능 플래그 활성화 필요)<br>";
        fullWarningMessage += "- Samsung Internet (버전 25 이상)<br>";
        fullWarningMessage += "- Opera Mobile (버전 80 이상)<br><br>";
        fullWarningMessage += "일부 브라우저나 구형 버전에서는 WebGPU가 기본적으로 비활성화되어 있거나, 실험적 기능 플래그를 통해 수동으로 활성화해야 할 수 있습니다. (예: <code>chrome://flags</code>, <code>edge://flags</code> 등)<br>";
        fullWarningMessage += "또한, WebGPU는 보안 연결(HTTPS 또는 localhost) 환경에서만 작동합니다.<br><br>";
        fullWarningMessage += "<b>계속 진행하시겠습니까?</b><br>";
        fullWarningMessage += "<span style='color:#d00'>(게임이 정상적으로 실행되지 않거나 일부 기능이 제한될 수 있습니다.)</span>";

        modalMsg.innerHTML = fullWarningMessage;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // 닫기 함수
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        // 취소: 모달 닫기
        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
        // 계속: 게임 페이지로 이동
        continueBtn.onclick = function () {
            closeModal();
            window.location.href = continueUrl;
        };
        // ESC 키로 닫기
        window.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', escListener);
            }
        });
        // 바깥 클릭 시 닫기
        modal.onclick = function (e) {
            if (e.target === modal) closeModal();
        };
    }
});
