

$(function(){
	let href = window.location.href
	let album = href.split('album=').pop()
	getImages(album)
	showOrHide()

	function getImages(album){
		$.ajax({
			url:'http://localhost:3000/showImages',
			dataType:'json',
			method:'post',
			data:{
				_id:album
			},
			success:function(res){
				console.log( res )
				if(res.status === 200){
					console.log( '请求成功！' )
					renderImages(res.data)
				}
			},
			error:function(err){
				console.log(  '错误信息:'+JSON.stringify(err))
			}

		})

	}

	//render images
	function renderImages(data){
		(function render(i){
			let width = i===0 ? 0:($('#wrap ').width()-300)/(i)
			if(i >= data.num) {
				return 
			}
			let str = ''
			// let mod = i%10
			// let text = mod === 0? `${i+1}st`: mod ===1? `${i+1}nd` : `${i+1}th` 
			let img = new Image
			img.src = '../src/'+data.directory+'/'+data.name[i]
			img.onload = function(){
				if( i === 0){
					str+=`
					<li class="active" data-imgWidth='${img.width}' data-imgHeight='${img.height}' data-title='${data.title}--NO.${i+1}/${data.num}'>
						<p></p>
					</li>
					`
				}else{
					str+=`
					<li data-imgWidth='${img.width}' data-imgHeight='${img.height}' data-title='${data.title}--NO.${i+1}/${data.num}'>
						<p></p>
					</li>
					`
				}
				$('#wrap .nav').append(str)
				$('#wrap .nav li').eq(i).css({
					'background':`#233 url(${img.src}) no-repeat center/cover`
				})
				$('#wrap .nav li:not(.active)').css({
					'width':`${width}px`
				})
				$('#wrap .nav li').off('mouseover')
				showImg($('#wrap .nav li'), width)
				render(i+1)
			}
		})(0);
	}

	function showImg(dom, width){
		let thisDom = dom.eq(dom.length-1)
		$('#bg .title').text(thisDom.attr('data-title'))
		$('#bg').css({
			'background':thisDom[0].style.background,
			'background-size': calculateImg(thisDom),
			'width':calculateImg(thisDom).split(' ')[0],
			'height':calculateImg(thisDom).split(' ')[1]
		})
		dom.on('mouseover', function(){
			if(!$(this).hasClass('active')){
				$('#wrap li').removeClass('active')
				$(this).addClass('active')

				// $(this).stop().animate({
				// 	width:300
				// },500,'linear')
				// $(this).siblings().stop().animate({
				// 	width:width
				// },500,'linear')
				$(this).css({width:'300px'})
				$(this).siblings().css({width:width+'px'})
				$('#bg .title').text($(this).attr('data-title'))
				$('#bg').css({
					'background':$(this)[0].style.background,
					'background-size': calculateImg($(this)),
					'width':calculateImg($(this)).split(' ')[0],
					'height':calculateImg($(this)).split(' ')[1]
				})
			}
			
		})
	}

	function calculateImg(dom){
		let height = dom.attr('data-imgHeight')
		let width = dom.attr('data-imgWidth')
		let winHeight = window.innerHeight
		let winWidth = window.innerWidth
		if(height>winHeight){
			return `${width*winHeight*0.96/height}px ${winHeight*0.96}px`
		}
		if(width >winWidth){
			return `${winWidth*0.96}px auto ${height*winHeight*0.96/width}px`
		}
		return `${width}px ${height}px`
	}

	function showOrHide(){
		$('#wrap .nav').on('mouseover', function(){
			$(this).removeClass('hide')
		}).on('mouseleave', function(){
			$(this).addClass('hide')
		})
	}
	
})