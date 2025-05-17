document.addEventListener('DOMContentLoaded', function () {
    const gamePlayLink = document.getElementById('game-play-link');

    if (gamePlayLink) {
        gamePlayLink.addEventListener('click', async function (event) {
            let webGPUSupportedByAPI = false;
            let adapterAvailable = false;
            let specificErrorMessage = "";

            if (!navigator.gpu) {
                specificErrorMessage = "현재 사용 중인 브라우저에서는 WebGPU API를 찾을 수 없습니다.\n";
                webGPUSupportedByAPI = false;
            } else {
                webGPUSupportedByAPI = true;
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) {
                        adapterAvailable = true;
                    } else {
                        specificErrorMessage = "WebGPU API는 브라우저에서 인식되지만, 현재 시스템에서 사용 가능한 WebGPU 호환 그래픽 어댑터(GPU)를 찾을 수 없습니다. 그래픽 드라이버를 최신 버전으로 업데이트하거나, 시스템 설정을 확인해 주십시오.\n";
                        adapterAvailable = false;
                    }
                } catch (error) {
                    console.error("WebGPU 어댑터 요청 중 오류 발생:", error);
                    specificErrorMessage = "WebGPU 어댑터를 요청하는 중 오류가 발생했습니다. 이는 안전하지 않은 오리진(HTTP 환경)에서 실행 중이거나, 브라우저 또는 시스템 설정 문제일 수 있습니다. 브라우저 콘솔에서 자세한 오류 내용을 확인해주세요.\n";
                    adapterAvailable = false;
                }
            }

            if (!webGPUSupportedByAPI || !adapterAvailable) {
                event.preventDefault();
                showWebGPUModal(specificErrorMessage, gamePlayLink.href);
            }
        });
    }

    function showWebGPUModal(specificErrorMessage, continueUrl) {
        const modal = document.getElementById('webgpu-modal');
        const modalMsg = document.getElementById('webgpu-modal-message');
        const closeBtn = document.getElementById('webgpu-modal-close');
        const cancelBtn = document.getElementById('webgpu-modal-cancel');
        const continueBtn = document.getElementById('webgpu-modal-continue');
        const template = document.getElementById('webgpu-warning-template');

        modalMsg.innerHTML = '';
        if (template && template.content) {
            modalMsg.appendChild(template.content.cloneNode(true));
        } else {
            modalMsg.textContent = 'WebGPU 안내';
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

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
