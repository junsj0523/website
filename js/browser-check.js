document.addEventListener('DOMContentLoaded', function () {
    const gamePlayLink = document.getElementById('game-play-link');

    if (gamePlayLink) {
        gamePlayLink.addEventListener('click', async function (event) {
            let webGPUSupportedByAPI = false;
            let adapterAvailable = false;
            let webgpuErrorMessage = "";
            let hwAccelWarningMessage = "";

            // 1. WebGPU 지원 여부만 체크 (원상 복구)
            if (!navigator.gpu) {
                webgpuErrorMessage = "현재 사용 중인 브라우저에서는 WebGPU API를 찾을 수 없습니다.\n";
                webGPUSupportedByAPI = false;
            } else {
                webGPUSupportedByAPI = true;
                try {
                    const adapter = await navigator.gpu.requestAdapter();
                    if (adapter) {
                        adapterAvailable = true;
                    } else {
                        webgpuErrorMessage = "WebGPU API는 브라우저에서 인식되지만, 현재 시스템에서 사용 가능한 WebGPU 호환 그래픽 어댑터(GPU)를 찾을 수 없습니다. 그래픽 드라이버를 최신 버전으로 업데이트하거나, 시스템 설정을 확인해 주십시오.\n";
                        adapterAvailable = false;
                    }
                } catch (error) {
                    console.error("WebGPU 어댑터 요청 중 오류 발생:", error);
                    webgpuErrorMessage = "WebGPU 어댑터를 요청하는 중 오류가 발생했습니다. 이는 안전하지 않은 오리진(HTTP 환경)에서 실행 중이거나, 브라우저 또는 시스템 설정 문제일 수 있습니다. 브라우저 콘솔에서 자세한 오류 내용을 확인해주세요.\n";
                    adapterAvailable = false;
                }
            }

            // 2. 하드웨어 가속 경고는 무조건 띄움
            let rendererInfo = '';
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    if (debugInfo) {
                        rendererInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    }
                }
            } catch (e) { }
            hwAccelWarningMessage = '[안내] 원활한 게임 실행을 위해 브라우저의 GPU 하드웨어 가속이 반드시 활성화되어 있어야 합니다.\n' +
                'Chrome: 설정 > 시스템 > "가능한 경우 하드웨어 가속 사용"을 켜고 브라우저를 재시작하세요.\n' +
                'Edge: 설정 > 시스템 및 성능 > "가능한 경우 하드웨어 가속 사용"을 켜고 브라우저를 재시작하세요.\n' +
                (rendererInfo ? `현재 렌더러: ${rendererInfo}\n` : '');

            // 1번: WebGPU 불가 시 경고, 닫으면 2번 안내
            if (!webGPUSupportedByAPI || !adapterAvailable) {
                event.preventDefault();
                showWebGPUModal(webgpuErrorMessage, function () {
                    showHWAccelModal(hwAccelWarningMessage, function () {
                        window.location.href = gamePlayLink.href;
                    });
                });
                return;
            }
            // 2번: WebGPU 가능하면 하드웨어 가속 안내만 띄움
            event.preventDefault();
            showHWAccelModal(hwAccelWarningMessage, function () {
                window.location.href = gamePlayLink.href;
            });
        });
    }

    // 기존 WebGPU 경고 모달 (콜백 지원)
    function showWebGPUModal(specificErrorMessage, onContinue) {
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
        if (specificErrorMessage) {
            const err = document.createElement('div');
            err.style.color = '#d00';
            err.style.margin = '12px 0';
            err.textContent = specificErrorMessage;
            modalMsg.appendChild(err);
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
            if (onContinue) onContinue();
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

    // 2번: 하드웨어 가속 안내 모달 (별도 구현)
    function showHWAccelModal(message, onContinue) {
        // 템플릿 기반 모달 생성
        let modal = document.getElementById('hwaccel-modal');
        const template = document.getElementById('hwaccel-warning-template');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hwaccel-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close" id="hwaccel-modal-close">&times;</span>
                    <div id="hwaccel-modal-message"></div>
                    <div class="modal-actions">
                        <button id="hwaccel-modal-continue">계속</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }
        const msg = modal.querySelector('#hwaccel-modal-message');
        msg.innerHTML = '';
        if (template && template.content) {
            msg.appendChild(template.content.cloneNode(true));
        } else {
            msg.textContent = message;
        }
        // 렌더러 정보가 있으면 표시
        if (typeof message === 'string' && message.includes('현재 렌더러:')) {
            const info = message.split('현재 렌더러:')[1];
            const infoSpan = msg.querySelector('#hwaccel-renderer-info');
            if (infoSpan) infoSpan.textContent = '현재 렌더러: ' + info.trim();
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        modal.querySelector('#hwaccel-modal-close').onclick = closeModal;
        modal.querySelector('#hwaccel-modal-continue').onclick = function () {
            closeModal();
            if (onContinue) onContinue();
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
