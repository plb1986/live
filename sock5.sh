cat > /root/socks5-install.sh << 'EOF'
#!/bin/bash
# ====================================================
# SOCKS5代理一键安装脚本
# 版本: 1.0
# 配置: 端口1080, 用户名pretty, 密码1314
# GitHub: 保存这个脚本到你的仓库
# ====================================================

# 配置参数（可修改）
PORT=1080
USER="pretty"
PASS="1314"

# 获取服务器IP
get_server_ip() {
    if command -v curl > /dev/null; then
        SERVER_IP=$(curl -s http://api.ipify.org 2>/dev/null || echo "127.0.0.1")
    else
        SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1")
    fi
    echo "$SERVER_IP"
}

# 颜色输出
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }

# 显示标题
show_header() {
    clear
    echo "=========================================="
    echo "  SOCKS5代理一键安装脚本 v1.0"
    echo "=========================================="
    echo "  端口: $PORT"
    echo "  用户: $USER"
    echo "  密码: $PASS"
    echo "=========================================="
    echo ""
}

# 检查系统
check_system() {
    yellow "检查系统..."
    
    # 检查root权限
    if [ "$EUID" -ne 0 ]; then 
        red "错误：请使用root权限运行此脚本"
        echo "使用: sudo bash $0"
        exit 1
    fi
    
    # 检查系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        green "系统: $NAME $VERSION"
    else
        yellow "未知系统，继续尝试..."
    fi
    
    # 检查curl
    if ! command -v curl > /dev/null; then
        yellow "安装curl..."
        apt install -y curl 2>/dev/null || yum install -y curl 2>/dev/null
    fi
}

# 清理环境
cleanup() {
    yellow "清理环境..."
    
    # 停止现有进程
    pkill -9 microsocks 2>/dev/null
    pkill -9 3proxy 2>/dev/null
    
    # 释放端口
    sudo fuser -k $PORT/tcp 2>/dev/null
    sudo fuser -k 1088/tcp 2>/dev/null
    
    sleep 2
}

# 安装依赖
install_dependencies() {
    green "安装必要依赖..."
    
    # 更新包管理器
    if command -v apt > /dev/null; then
        apt update -q
        apt install -y git make gcc curl wget 2>/dev/null
    elif command -v yum > /dev/null; then
        yum install -y git make gcc curl wget 2>/dev/null
    elif command -v dnf > /dev/null; then
        dnf install -y git make gcc curl wget 2>/dev/null
    else
        red "不支持的包管理器"
        exit 1
    fi
}

# 安装microsocks
install_microsocks() {
    green "安装microsocks..."
    
    cd /root
    
    # 克隆或更新源码
    if [ -d "microsocks" ]; then
        cd microsocks
        git pull > /dev/null 2>&1
    else
        git clone https://github.com/rofl0r/microsocks.git
        cd microsocks
    fi
    
    # 编译安装
    make clean > /dev/null 2>&1
    make > /dev/null 2>&1
    
    # 安装到系统
    if [ -f "microsocks" ]; then
        cp microsocks /usr/local/bin/
        chmod +x /usr/local/bin/microsocks
        green "✅ microsocks安装完成"
    else
        red "❌ microsocks编译失败"
        exit 1
    fi
    
    cd /root
}

# 启动SOCKS5服务
start_service() {
    green "启动SOCKS5代理..."
    
    # 检查端口是否被占用
    if netstat -tln | grep -q ":$PORT "; then
        yellow "端口 $PORT 被占用，尝试清理..."
        cleanup
    fi
    
    # 启动服务
    nohup /usr/local/bin/microsocks -p $PORT -u $USER -P $PASS > /var/log/socks5.log 2>&1 &
    
    sleep 3
    
    # 检查是否启动成功
    if ps aux | grep -q "[m]icrosocks"; then
        green "✅ SOCKS5代理启动成功"
    else
        red "❌ SOCKS5代理启动失败"
        yellow "尝试直接运行..."
        /usr/local/bin/microsocks -p $PORT -u $USER -P $PASS &
        sleep 2
    fi
}

# 配置防火墙
setup_firewall() {
    yellow "配置防火墙..."
    
    if command -v ufw > /dev/null; then
        if ufw status | grep -q "active"; then
            ufw allow $PORT/tcp > /dev/null 2>&1
            ufw reload > /dev/null 2>&1
            green "✅ 防火墙已配置"
        fi
    elif command -v firewall-cmd > /dev/null; then
        firewall-cmd --permanent --add-port=$PORT/tcp > /dev/null 2>&1
        firewall-cmd --reload > /dev/null 2>&1
        green "✅ 防火墙已配置"
    else
        yellow "⚠️  未找到防火墙工具，请手动开放端口 $PORT"
    fi
}

# 测试代理
test_proxy() {
    yellow "测试代理连接..."
    
    # 等待服务稳定
    sleep 2
    
    # 测试代理
    local result
    result=$(timeout 10 curl --socks5 $USER:$PASS@127.0.0.1:$PORT -s http://api.ipify.org 2>/dev/null || echo "")
    
    if [ -n "$result" ]; then
        green "✅ 代理测试成功！"
        echo "   通过代理的IP: $result"
        return 0
    else
        red "❌ 代理测试失败"
        yellow "查看日志: tail -f /var/log/socks5.log"
        return 1
    fi
}

# 创建管理脚本
create_manager() {
    green "创建管理脚本..."
    
    SERVER_IP=$(get_server_ip)
    
    cat > /usr/local/bin/socks5-manage << 'MANAGER'
#!/bin/bash
PORT=1080
USER="pretty"
PASS="1314"
SERVER_IP=$(curl -s http://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

case "$1" in
    start)
        echo "启动SOCKS5代理..."
        pkill microsocks 2>/dev/null
        nohup /usr/local/bin/microsocks -p $PORT -u $USER -P $PASS > /dev/null 2>&1 &
        sleep 2
        if ps aux | grep -q "[m]icrosocks"; then
            echo "✅ 启动成功"
        else
            echo "❌ 启动失败"
        fi
        ;;
    stop)
        echo "停止SOCKS5代理..."
        pkill microsocks
        echo "✅ 已停止"
        ;;
    restart)
        echo "重启SOCKS5代理..."
        $0 stop
        $0 start
        ;;
    status)
        echo "SOCKS5代理状态:"
        if ps aux | grep -q "[m]icrosocks"; then
            echo "✅ 运行中"
            echo "   进程PID: $(pgrep microsocks)"
            echo "   端口: $PORT"
        else
            echo "❌ 未运行"
        fi
        ;;
    test)
        echo "测试代理..."
        curl --socks5 $USER:$PASS@127.0.0.1:$PORT http://api.ipify.org
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ 代理工作正常"
        else
            echo ""
            echo "❌ 代理测试失败"
        fi
        ;;
    info)
        echo "========== SOCKS5代理信息 =========="
        echo "服务器: $SERVER_IP:$PORT"
        echo "用户名: $USER"
        echo "密码: $PASS"
        echo "类型: SOCKS5"
        echo ""
        echo "测试命令:"
        echo "curl --socks5 $USER:$PASS@$SERVER_IP:$PORT http://api.ipify.org"
        ;;
    log)
        if [ -f "/var/log/socks5.log" ]; then
            tail -f /var/log/socks5.log
        else
            echo "日志文件不存在"
        fi
        ;;
    *)
        echo "用法: socks5-manage {start|stop|restart|status|test|info|log}"
        echo ""
        echo "命令说明:"
        echo "  start   启动代理"
        echo "  stop    停止代理"
        echo "  restart 重启代理"
        echo "  status  查看状态"
        echo "  test    测试代理"
        echo "  info    查看连接信息"
        echo "  log     查看日志"
        ;;
esac
MANAGER
    
    chmod +x /usr/local/bin/socks5-manage
    green "✅ 管理脚本已创建: socks5-manage"
}

# 设置开机自启
setup_autostart() {
    green "设置开机自启..."
    
    # 创建启动脚本
    cat > /etc/init.d/socks5 << 'INIT'
#!/bin/sh
### BEGIN INIT INFO
# Provides:          socks5
# Required-Start:    $network $remote_fs $syslog
# Required-Stop:     $network $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: SOCKS5 Proxy Server
### END INIT INFO

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/bin/microsocks
NAME=socks5
DESC="SOCKS5 Proxy Server"
PIDFILE=/var/run/socks5.pid

case "$1" in
    start)
        echo "启动 $DESC..."
        if [ -f $PIDFILE ] && kill -0 $(cat $PIDFILE) 2>/dev/null; then
            echo "$DESC 已经在运行"
        else
            $DAEMON -p 1080 -u pretty -P 1314 &
            echo $! > $PIDFILE
            echo "$DESC 已启动"
        fi
        ;;
    stop)
        echo "停止 $DESC..."
        if [ -f $PIDFILE ]; then
            kill $(cat $PIDFILE) 2>/dev/null
            rm -f $PIDFILE
            echo "$DESC 已停止"
        else
            echo "$DESC 未运行"
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f $PIDFILE ] && kill -0 $(cat $PIDFILE) 2>/dev/null; then
            echo "$DESC 运行中 (PID: $(cat $PIDFILE))"
        else
            echo "$DESC 未运行"
        fi
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0
INIT
    
    chmod +x /etc/init.d/socks5
    
    # 添加到启动项
    if command -v update-rc.d > /dev/null; then
        update-rc.d socks5 defaults
    elif command -v chkconfig > /dev/null; then
        chkconfig --add socks5
    else
        # 使用crontab
        (crontab -l 2>/dev/null | grep -v "socks5"; echo "@reboot /usr/local/bin/socks5-manage start") | crontab -
    fi
    
    green "✅ 开机自启已设置"
}

# 显示完成信息
show_complete() {
    SERVER_IP=$(get_server_ip)
    
    echo ""
    echo "=========================================="
    green "✅ SOCKS5代理安装完成！"
    echo "=========================================="
    echo ""
    echo "连接信息:"
    echo "┌────────────────────────────────────────┐"
    echo "│  服务器: $SERVER_IP:$PORT"
    echo "│  用户名: $USER"
    echo "│  密码: $PASS"
    echo "│  类型: SOCKS5"
    echo "└────────────────────────────────────────┘"
    echo ""
    echo "管理命令:"
    echo "  socks5-manage start     # 启动代理"
    echo "  socks5-manage stop      # 停止代理"
    echo "  socks5-manage status    # 查看状态"
    echo "  socks5-manage test      # 测试代理"
    echo "  socks5-manage info      # 查看连接信息"
    echo ""
    echo "一键测试命令:"
    echo "  curl --socks5 $USER:$PASS@$SERVER_IP:$PORT http://api.ipify.org"
    echo ""
    echo "日志文件: /var/log/socks5.log"
    echo "=========================================="
    echo ""
    yellow "如需保存此脚本到GitHub:"
    echo "1. 在GitHub创建新仓库"
    echo "2. 上传此脚本: cp /root/socks5-install.sh /path/to/your/repo/"
    echo "3. 提交并推送"
}

# 主函数
main() {
    show_header
    check_system
    cleanup
    install_dependencies
    install_microsocks
    start_service
    setup_firewall
    create_manager
    setup_autostart
    test_proxy
    show_complete
}

# 运行主函数
main "$@"

exit 0
EOF

# 设置执行权限
chmod +x /root/socks5-install.sh
