
//每页显示的数量
const NUM = 16
let page = 1
let returnNum = null //查询返回的数量  最后一页可能！=NUM

$(function(){

	//skip page
	$('#menu li:not(.go,.skip)').on('click', function(){
		if($(this).hasClass('page')){
			if(page == $(this).text()) return
			page = $(this).text()
		}else if($(this).hasClass('next') ){
			if(page == $('#menu .page').eq(5).text()) return
			page++
		}else if($(this).hasClass('prev')){
			if(page == 1) return 
			page--
		}else if($(this).hasClass('first')){
			if(page ==1) return
			page = 1
		}else if($(this).hasClass('last')){
			if(page == $('#menu .page').eq(5).text()) return
			page = $('#menu .page').eq(5).text()
		}
		$('#wrap').html('')
		$('#menu').removeClass('active')
		getImages(page)
	})

	//GO
	$('#menu li.go button').click(function(){
		let val = parseInt($(this).siblings('input').val())
		if(typeof val == 'number' && val <=$('#menu .page').eq(5).text() && val >1){
			page = val
			$('#wrap').html('')
			$('#menu').removeClass('active')
			getImages(page)
		}
	})

	//enter
	$('#menu li.go input').on('keydown', function(e){
		if(e.keyCode == 13){
			let val = parseInt($(this).val())
			if(typeof val == 'number' && val <=$('#menu .page').eq(5).text() && val >1){
				page = val
				$('#wrap').html('')
				$('#menu').removeClass('active')
				getImages(page)
			}
		}
	})




	getImages(page)
	//ajax getImages
	function getImages(page){
		$.ajax({
			url:'http://localhost:3000/queryImages',
			dataType:'json',
			method:'post',
			data:{
				page:page,
				num:NUM
			},
			success:function(res){
				console.log( res )
				if(res.status === 200){
					console.log( '请求成功！' )
					returnNum = res.length
					renderImagesOneByOne(res.data)
					renderPage(res.sum)
				}
			},
			error:function(err){
				console.log(  '错误信息:'+JSON.stringify(err))
			}

		})

	}
	//renderImagesOneByOne
	function renderImagesOneByOne(data){
		(function render(i, index){
			if(i >= returnNum) {
				
				return $('#menu').addClass('active')
			}
			let str = ''
			let cover ='src/'+ data[i].directory+'/'+data[i].name[index]
			getHeightImages(cover, function(){
				let title = data[i].title
				let time = data[i].whichYear+'-'+data[i].whichMon+'-'+data[i].whichDay
				let count = data[i].num
				str+=`
					<div class="box" data-where = '${data[i]._id}'>
						<div class="cover">
							<img src="${cover}" title='${title}'>
						</div>
						<span class="title nowrap">${title}</span>
						<p class="time left">${time}</p>
						<p class="count right">${count}</p>
					</div>
				`
				$('#wrap').append(str)
				//jump to album
				$('#wrap div.box').eq(i).on('click', function(){
					window.location = './html/album.html?album='+$(this).attr('data-where')
				})
				//new Image的时候已经判断过是否加载完毕
				// $('#wrap .cover img').eq(i).on('load', ()=>{
					render(i+1, 0)
				// })
			}, function(){
				render(i, index+1)
			})
			
		})(0 ,0)
	}

	//choose images which height > width
	function getHeightImages(image, callbackA, callbackB){
		let img = new Image
		img.src = image
		img.onload = function(){
			let height = img.height
			let width = img.width
			if(height > width){
				callbackA()
			}else{
				callbackB()
			}
		}

	}
	//render pages
	function renderPage(num){
		$('#menu li.page a').eq(5).text(num)
		$('#menu li.page a').eq(4).text(num-1)
		page = parseInt(page)
		if(page == 1){
			$('#menu li.page a').eq(3).text(page+3)
			$('#menu li.page a').eq(2).text(page+2)
			$('#menu li.page a').eq(1).text(page+1)
			$('#menu li.page a').eq(0).text(page)
		}else if(page>=num-3){
			$('#menu li.page a').eq(3).text(num-2)
			$('#menu li.page a').eq(2).text(num-3)
			$('#menu li.page a').eq(1).text(num-4)
			$('#menu li.page a').eq(0).text(num-5)
		}else{
			$('#menu li.page a').eq(3).text(page+2)
			$('#menu li.page a').eq(2).text(page+1)
			$('#menu li.page a').eq(1).text(page)
			$('#menu li.page a').eq(0).text(page-1)
		}
		$('#menu li.page ').map((index,item)=>{
			if($(item).text() == page) $(item).addClass('active').siblings().removeClass('active')
		})
	}
})